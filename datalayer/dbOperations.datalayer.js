/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
const { Op, QueryTypes } = require('sequelize');
const { contacts, sequelize } = require('../service/postgres.sequelize.database.service');

class dbOperations {
  static fetchRecordsByPhoneAndEmail = async (phoneNumber, email) => {
    const records = await contacts.findAll({
      where: { [Op.or]: [{ phoneNumber }, { email }] },
      order: [['linkPrecedence', 'ASC'], ['createdAt', 'ASC']],
    });
    return records;
  };

  static fetchRecordsByPhone = async (phoneNumber) => {
    const records = await contacts.findAll({
      where: { phoneNumber: { [Op.in]: phoneNumber } },
      order: [['linkPrecedence', 'ASC'], ['createdAt', 'ASC']],
    });
    return records;
  };

  static fetchPhoneByEmail = async (email) => {
    let phoneNumbersByEmail = await contacts.findAll({
      where: { email },
      attributes: ['phoneNumber'],
      order: [['linkPrecedence', 'ASC']],
    });
    phoneNumbersByEmail = phoneNumbersByEmail.map((phoneNumberByEmail) => phoneNumberByEmail.dataValues.phoneNumber);
    return phoneNumbersByEmail;
  };

  static processRecords = (records) => {
    const emails = [];
    const phoneNumbers = new Set();
    const secondaryContactIds = new Set();

    records.forEach((record) => {
      emails.push(record.dataValues?.email);
      const singlePhoneNumber = record.dataValues?.phoneNumber;
      if (singlePhoneNumber) phoneNumbers.add(singlePhoneNumber);
      if (record.dataValues?.linkPrecedence === 'secondary') secondaryContactIds.add(record.dataValues?.id);
    });

    return {
      primaryContactId: records[0].dataValues.id,
      emails,
      phoneNumbers: [...phoneNumbers],
      secondaryContactIds: [...secondaryContactIds],
    };
  };

  static updateRecordsToSecondary = async (records) => {
    for (let i = 1; i < records.length; i += 1) {
      await contacts.update({ linkPrecedence: 'secondary', linkedId: records[0].dataValues.id }, { where: { id: records[i].dataValues.id } });
    }
  };

  static createSecondaryContact = async (records, email, phoneNumber) => {
    let id = await sequelize.query('Select MAX(id) from contacts.contacts', { type: QueryTypes.SELECT });
    id = Number(JSON.stringify(id[0].max));
    id += 1;
    const updatedRecords = await contacts.create({
      id, email, phoneNumber, linkPrecedence: 'secondary', linkedId: records[0].dataValues.id,
    });
    return updatedRecords;
  };

  static createNewContact = async (email, phoneNumber) => {
    let id = await sequelize.query('Select MAX(id) from contacts.contacts', { type: QueryTypes.SELECT });
    id = Number(JSON.stringify(id[0].max));
    id += 1;
    // In below query check if we need to add empty secondaryContactIds
    const createdRecord = await contacts.create({
      id, email, phoneNumber, linkPrecedence: 'primary',
    });
    return createdRecord;
  };
}

module.exports = dbOperations;
