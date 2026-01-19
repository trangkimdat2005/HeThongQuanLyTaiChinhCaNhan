using HeThongQuanLyTaiChinhCaNhan.Services.Interfaces;
using System.Net;
using System.Net.Mail;

namespace HeThongQuanLyTaiChinhCaNhan.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string content)
        {
            var mailSettings = _configuration.GetSection("MailSettings");

            var message = new MailMessage();
            message.From = new MailAddress(mailSettings["Mail"], mailSettings["DisplayName"]);
            message.To.Add(new MailAddress(toEmail));
            message.Subject = subject;
            message.Body = content;
            message.IsBodyHtml = true;

            using (var smtp = new SmtpClient(mailSettings["Host"], int.Parse(mailSettings["Port"])))
            {
                smtp.Credentials = new NetworkCredential(mailSettings["Mail"], mailSettings["Password"]);
                smtp.EnableSsl = true;
                await smtp.SendMailAsync(message);
            }
        }
    }
}
