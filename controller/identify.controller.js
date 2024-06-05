const { sequelize } = require('../service/postgres.sequelize.database.service');
const dbOperations = require('../datalayer/dbOperations.datalayer');

sequelize.options.logging = console.log;

const identify = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    let records;
    let contactDetails;
    let phoneNumbersByEmail;
    let matchExists = false;

    if (phoneNumber && email) {
      records = await dbOperations.fetchRecordsByPhoneAndEmail(phoneNumber, email);
    } else if (phoneNumber) {
      records = await dbOperations.fetchRecordsByPhone([phoneNumber]);
    } else {
      phoneNumbersByEmail = await dbOperations.fetchPhoneByEmail(email);
      records = await dbOperations.fetchRecordsByPhone(phoneNumbersByEmail);
    }

    /* To check for existing contacts against incoming request where both phoneNumber and email or one of them already exists
    in our DB else create new record */
    if (phoneNumber && email) {
      records.forEach((record) => {
        if (record.dataValues.email === email && record.dataValues.phoneNumber === phoneNumber) {
          matchExists = true;
        }
      });
    } else if (phoneNumber) {
      records.forEach((record) => {
        if (record.dataValues.phoneNumber === phoneNumber) {
          matchExists = true;
        }
      });
    } else {
      records.forEach((record) => {
        if (record.dataValues.email === email) {
          matchExists = true;
        }
      });
    }

    /* To check if all the contacts are primary against the incoming request */
    const allPrimary = records.every((record) => record.dataValues.linkPrecedence === 'primary');

    if (records.length !== 0 && matchExists) {
      contactDetails = dbOperations.processRecords(records);
    } else if (records.length !== 0 && !matchExists) {
      if (allPrimary && records.length > 1) {
        await dbOperations.updateRecordsToSecondary(records);
        records = await dbOperations.fetchRecordsByPhoneAndEmail(phoneNumber, email);
        contactDetails = dbOperations.processRecords(records);
      } else {
        let updatedRecords = await dbOperations.createSecondaryContact(records, email, phoneNumber);
        updatedRecords = [updatedRecords];
        records = [...records, ...updatedRecords];
        contactDetails = dbOperations.processRecords(records);
      }
    } else {
      records = await dbOperations.createNewContact(email, phoneNumber);
      records = [records];
      contactDetails = dbOperations.processRecords(records);
    }

    res.send({
      contact: contactDetails,
    });
  } catch (error) {
    console.error('Error in identify', error);
  }
};

module.exports = { identify };
