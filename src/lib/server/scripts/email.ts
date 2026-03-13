
import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';
import { EMAIL_VERIFICATION_TIMEOUT_MS } from './auth';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: env.GMAIL_USER,
		pass: env.GMAIL_PASSWORD
	}
});

export async function sendEmail(to: string, subject: string, html: string) {
	try {
		await transporter.sendMail({
			from: env.GMAIL_USER,
			to, subject, html
		});
	} catch (error) {
		console.error(`Failed to send email: ${error}`)
	}
}

export const emailVerificationTemplate = (username: string, code: string) => {
	const formattedTimeout = Math.round(EMAIL_VERIFICATION_TIMEOUT_MS / 60000)
	const formattedCode = code.split('').join(' ')

	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8" />
	<title>Verify Your Email</title>
</head>
<body style="margin:0; padding:20px; font-family: Arial, sans-serif; color:#141204;">
	<table width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffffff">
		<tr><td align="center">
			<table width="600" cellspacing="0" cellpadding="0" bgcolor="#f7f9f7" style="border-radius:8px; padding:30px;">
				<tr><td align="center" style="font-size:24px; font-weight:bold; padding-bottom:20px;">
					Welcome friend ❤️
				</td></tr>
				<tr><td style="font-size:16px; line-height:24px; padding-bottom:30px;">
					Hi ${username}, <br />
					Thanks for signing up! To complete your registration, please verify your
					email address using the code below.
				</td></tr>
				<tr><td align="center" style="font-size:32px; font-weight:bold;">
					${formattedCode}
				</td></tr>
				<tr><td align="center" style="font-size:12px; color:#86867E; padding-top:30px;">
					This code will expire in ${formattedTimeout} minutes for your security.
				</td></tr>
			</table>
		</td></tr>
	</table>
</body>
</html>
`}

export const emailChangeNotificationTemplate = (username: string) => {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8" />
	<title>Change of email</title>
</head>
<body style="margin:0; padding:20px; font-family: Arial, sans-serif; color:#141204;">
	<table width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffffff">
		<tr><td align="center">
			<table width="600" cellspacing="0" cellpadding="0" bgcolor="#f7f9f7" style="border-radius:8px; padding:30px;">
				<tr><td align="center" style="font-size:24px; font-weight:bold; padding-bottom:20px;">
					Change of email ⚠️
				</td></tr>
				<tr><td style="font-size:16px; line-height:24px; padding-bottom:30px;">
					Hi ${username}, <br />
					You have successfully changed your email! This will be the last message you recieve from us on this address. If you did not request a change of email, take immediate action.
				</td></tr>
			</table>
		</td></tr>
	</table>
</body>
</html>
`}
