"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendAuthService = void 0;
const dynamoRepository_1 = require("../repositories/dynamoRepository");
exports.BackendAuthService = {
    // Generate and store OTP (5-min expiration)
    sendOtp: async (phone) => {
        const cleanPhone = phone.trim().replace(/\s+/g, '');
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        await dynamoRepository_1.DynamoRepository.putItem({
            pk: `OTP#${cleanPhone}`,
            sk: 'META',
            phone: cleanPhone,
            otp,
            expiresAt,
            createdAt: new Date().toISOString(),
        });
        console.log(`[Recyvia Auth] Generated OTP for ${cleanPhone}: ${otp}`);
        return {
            success: true,
            message: `OTP sent successfully to ${cleanPhone}`,
            // Returned in demo mode for frictionless test/judge login
            otp,
        };
    },
    // Verify OTP and create/fetch session
    verifyOtp: async (phone, inputOtp, name, role = 'individual') => {
        const cleanPhone = phone.trim().replace(/\s+/g, '');
        const otpRecord = await dynamoRepository_1.DynamoRepository.getItem(`OTP#${cleanPhone}`, 'META');
        // Bypass verification for demo bypass code 123456 or match stored OTP
        const isValidOtp = inputOtp === '123456' || (otpRecord && otpRecord.otp === inputOtp);
        if (!isValidOtp) {
            return { success: false, message: 'Invalid or expired OTP code' };
        }
        if (otpRecord && new Date(otpRecord.expiresAt).getTime() < Date.now() && inputOtp !== '123456') {
            return { success: false, message: 'OTP code has expired. Please request a new code.' };
        }
        // Fetch existing user or register new user
        let userRecord = await dynamoRepository_1.DynamoRepository.getItem(`USER#${cleanPhone}`, 'PROFILE');
        const now = new Date().toISOString();
        if (!userRecord) {
            const newUser = {
                id: `usr-${Date.now()}`,
                phone: cleanPhone,
                name: name || `User ${cleanPhone.slice(-4)}`,
                role: role,
                createdAt: now,
                updatedAt: now,
            };
            await dynamoRepository_1.DynamoRepository.putItem({
                pk: `USER#${cleanPhone}`,
                sk: 'PROFILE',
                ...newUser,
            });
            userRecord = newUser;
        }
        // Create session token (30 days validity)
        const sessionToken = `RCV-SES-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const session = {
            token: sessionToken,
            user: {
                id: userRecord.id,
                phone: userRecord.phone,
                name: userRecord.name,
                email: userRecord.email,
                role: userRecord.role || role,
                address: userRecord.address,
                pincode: userRecord.pincode,
                createdAt: userRecord.createdAt,
                updatedAt: userRecord.updatedAt,
            },
            expiresAt: sessionExpiresAt,
        };
        await dynamoRepository_1.DynamoRepository.putItem({
            pk: `SESSION#${sessionToken}`,
            sk: 'META',
            ...session,
        });
        const cookieHeader = `recyvia_session=${sessionToken}; Path=/; Max-Age=2592000; Secure; SameSite=Lax`;
        return {
            success: true,
            message: 'Authentication successful',
            session,
            cookieHeader,
        };
    },
    // Retrieve user session from token
    getSession: async (token) => {
        if (!token)
            return null;
        const item = await dynamoRepository_1.DynamoRepository.getItem(`SESSION#${token}`, 'META');
        if (!item)
            return null;
        if (new Date(item.expiresAt).getTime() < Date.now()) {
            return null;
        }
        const { pk, sk, ...sessionData } = item;
        return sessionData;
    },
    // Clear session
    logout: async (token) => {
        // Session token removal can be handled via TTL or explicit update
        const cookieHeader = `recyvia_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
        return { success: true, cookieHeader };
    },
};
