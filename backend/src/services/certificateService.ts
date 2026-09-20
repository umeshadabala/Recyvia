import { DynamoRepository } from '../repositories/dynamoRepository';
import { CertificateEntity, PickupRequestEntity } from '../types/index';

export const BackendCertificateService = {
  createCertificateForPickup: async (pickup: PickupRequestEntity, transactionId: string): Promise<CertificateEntity> => {
    const certId = `cert-${Date.now()}`;
    const certNumber = `RCV-WS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const itemsSummary = pickup.wasteItems.map((item) => {
      const weight = item.verifiedWeightKg || item.estimatedWeightKg;
      return {
        categoryName: item.categoryName,
        weightKg: weight,
        ratePerKg: item.ratePerKg,
        amount: item.totalAmount || weight * item.ratePerKg,
      };
    });

    const totalWeightKg = itemsSummary.reduce((acc, i) => acc + i.weightKg, 0);
    const totalAmountPaid = itemsSummary.reduce((acc, i) => acc + i.amount, 0);
    const co2OffsetKg = parseFloat((totalWeightKg * 2.8).toFixed(1));
    const treesSavedEquivalent = Math.max(1, Math.round(co2OffsetKg / 20));
    const landfillDivertedKg = totalWeightKg;
    const verificationHash = `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const newCert: CertificateEntity = {
      id: certId,
      certificateNumber: certNumber,
      transactionId,
      pickupId: pickup.id,
      sellerName: pickup.customerName,
      sellerType: pickup.customerType,
      collectorName: pickup.collectorName || 'Recyvia Collector Partner',
      recyclerName: pickup.recyclerName || 'EcoRecycle Solutions CPCB Facility',
      itemsSummary,
      totalWeightKg,
      totalAmountPaid,
      co2OffsetKg,
      treesSavedEquivalent,
      landfillDivertedKg,
      verificationHash,
      issuedAt: now,
    };

    await DynamoRepository.putItem({
      pk: `CERTIFICATE#${certId}`,
      sk: 'META',
      ...newCert,
    });

    return newCert;
  },

  getAllCertificates: async (): Promise<CertificateEntity[]> => {
    const items = await DynamoRepository.scanByEntityPrefix('CERTIFICATE#');
    return items
      .filter((i: any) => i.sk === 'META')
      .map(({ pk, sk, ...data }: any) => data as CertificateEntity);
  },

  getCertificateById: async (certId: string): Promise<CertificateEntity | null> => {
    const item = await DynamoRepository.getItem(`CERTIFICATE#${certId}`, 'META');
    if (!item) return null;
    const { pk, sk, ...data } = item;
    return data as CertificateEntity;
  },
};
