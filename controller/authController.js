const {user: User} = require('../model')
const moment = require('moment')
const jwt = require("jsonwebtoken");
const nodeMailer = require('nodemailer')
const bcrypt = require('bcryptjs')

exports.login = (req, res) => {
    const {usernameOrEmail, password} = req.body;
    if (usernameOrEmail && password) {
        User.findOne({
            $or: [
                {username: usernameOrEmail},
                {email: usernameOrEmail}
            ]
        }).select("username password email profile_picture email_status loginWithFacebook loginWithGoogle").then(data => {
            if (data && (data.email_status || data.loginWithFacebook || data.loginWithGoogle)) {

                bcrypt.compare(password, data.password).then(check => {
                    if (check) {
                        const {profile_picture} = data;

                        delete data.profile_picture;
                        delete data.password;
                        delete data.email_status;
                        delete data.loginWithFacebook;
                        delete data.loginWithGoogle;
                        jwt.sign({
                            username: data.username,
                            email: data.email,
                            id: data._id
                        }, process.env.JWTTOKEN, {expiresIn: "100000h"}, (err, token) => {
                            data.profile_picture = profile_picture;
                            return res.status(200).json({
                                _token: token,
                                username: data.username,
                                profile_picture: data.profile_picture,
                                email: data.email,
                            });
                        })
                    } else {
                        return res.status(403).json()
                    }
                }).catch(err => res.status(500).json(err))
            } else {
                return res.status(404).json()
            }
        }).catch(err => res.status(500).json(err))
    } else {
        res.status(400).json()
    }
};
exports.register = (req, res) => {
    const {username, password, email, noHp, loginWithGoogle, loginWithFacebook} = req.body;
    if (!username && !password) {
        return res.status(400).json()
    }
    if (email != null || (loginWithGoogle || loginWithFacebook)) {
        bcrypt.hash(password, Number(process.env.BcryptSalt)).then(password => {
            const userData = {
                username: username,
                password: password,
                email: email || null,
                phone: noHp || "0",
                loginWithGoogle: loginWithGoogle || false,
                loginWithFacebook: loginWithFacebook || false
            };
            if (!loginWithFacebook && !loginWithGoogle) {
                const token = Math.floor((Math.random() * 1000000) + 1); //generate 6 number token
                userData.email_token = token;
                userData.email_token_expire = moment(Date.now()).add(3, "minutes").toISOString();
                const transpoter = nodeMailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    service: "Gmail",
                    requireTLS: true,
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.EMAILPASSWORD
                    }
                });
                const mailOption = {
                    from: "fanATTIC Email Verification",
                    to: email,
                    subject: "Email Verification",
                    html: `Hello ${username}! Thank you for registering, your token verification is <b>${token}</b>. IMPORTANT! NEVER TELL YOUR TOKEN TO ANYONE!`
                };
                transpoter.sendMail(mailOption, err => {
                    if (err) {
                        return res.status(500).json({err: err});
                    }
                });
            } else {
                userData.email_status = true;
            }
            new User(userData).save()
                .then(() => res.status(201).json())
                .catch(err => res.status(500).json({err: err}))
        }).catch(err => res.status(500).json({err: err}))
    } else {
        return res.status(403).json()
    }
};

exports.verifyEmail = (req, res) => {
    const {token, email} = req.body;
    User.countDocuments({
        email: email,
        email_token: token,
        email_token_expire: {$gte: moment(Date.now()).toISOString()}
    })
        .then(doc => {
            if (doc) {
                User.findOneAndUpdate({email: email}, {email_status: true, email_verification_token: null})
                    .then(() => res.status(202).json())
                    .catch(err => res.status(500).json(err));
            } else {
                return res.status(404).json({msg: "Token not found or has been expired"})
            }
        }).catch(err => res.status(500).json(err))
};
