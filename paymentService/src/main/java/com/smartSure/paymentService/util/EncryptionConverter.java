package com.smartSure.paymentService.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class EncryptionConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }
        return CryptoUtils.encrypt(plainText);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return dbData;
        }
        try {
            return CryptoUtils.decrypt(dbData);
        } catch (Exception e) {
            // For backward compatibility on plain strings returning as-is
            return dbData;
        }
    }
}
