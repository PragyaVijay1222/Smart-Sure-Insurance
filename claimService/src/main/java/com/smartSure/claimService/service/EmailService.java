package com.smartSure.claimService.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    public void sendClaimDecisionEmail(String toEmail, String userName, Long claimId, String decision) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            String subject = "SmartSure — Your Claim #" + claimId + " has been " + decision;
            helper.setSubject(subject);
            
            String textBody = buildEmailBody(userName, claimId, decision);
            String htmlBody = buildHtmlEmail(subject, textBody);
            helper.setText(htmlBody, true);
            
            mailSender.send(message);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to send claim email", ex);
        }
    }

    private String buildHtmlEmail(String subject, String textBody) {
        String formattedText = textBody.replace("\n", "<br>");
        return "<html><body style='font-family: \"Inter\", Arial, sans-serif; background-color: #f4f4f5; padding: 30px;'>" +
               "<div style='max-width: 600px; margin: 0 auto;'>" +
               "<div style='background: linear-gradient(135deg, #0ea5e9, #2563eb); color: white; padding: 25px; border-radius: 12px 12px 0 0;'>" +
               "<h2 style='margin: 0; font-weight: 700;'>" + subject + "</h2></div>" +
               "<div style='background-color: white; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e4e4e7; border-top: none; line-height: 1.7; color: #3f3f46; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'>" +
               formattedText +
               "</div>" +
               "<p style='text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 20px;'>© 2026 Smart Sure Insurance. All rights reserved.</p>" +
               "</div></body></html>";
    }

    private String buildEmailBody(String userName, Long claimId, String decision) {
        if ("APPROVED".equals(decision)) {
            return "Dear " + userName + ",\n\n"
                + "We are pleased to inform you that your insurance claim (ID: " + claimId + ") "
                + "has been APPROVED.\n\n"
                + "Our team will process the settlement shortly. "
                + "You will receive further communication regarding the payout.\n\n"
                + "Thank you for choosing SmartSure.\n\nRegards,\nSmartSure Claims Team";
        } else {
            return "Dear " + userName + ",\n\n"
                + "We regret to inform you that your insurance claim (ID: " + claimId + ") "
                + "has been REJECTED.\n\n"
                + "If you believe this decision is incorrect or wish to appeal, "
                + "please contact our support team with your claim ID.\n\n"
                + "Thank you for choosing SmartSure.\n\nRegards,\nSmartSure Claims Team";
        }
    }
}
