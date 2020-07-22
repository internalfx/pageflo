const Promise = require(`bluebird`)
const rp = require(`request-promise`)

module.exports = function (config) {
  let mailer
  let send

  if (config.mailer.type === `direct`) {
    const directTransport = require(`nodemailer-direct-transport`)
    mailer = Promise.promisifyAll(require(`nodemailer`).createTransport(directTransport()))
    send = function (mail) {
      mail.from = config.mailer.fromEmail || `noreply@example.com`
      return mailer.sendMailAsync(mail)
    }
  } else if (config.mailer.type === `mailgun`) {
    send = function (mail) {
      return rp({
        uri: `https://api:${config.mailer.api_key}@api.mailgun.net/v3/${config.mailer.domain}/messages`,
        method: `POST`,
        formData: {
          from: config.mailer.fromEmail,
          to: mail.to,
          subject: mail.subject,
          text: mail.text || ``,
          html: mail.html || ``,
          attachment: mail.attachment || []
        }
      })
    }
  }

  return Object.freeze({
    send
  })
}
