module.exports = (sequelize, Sequelize) => {
  const Contacts = sequelize.define('contacts', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    phoneNumber: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    linkPrecedence: {
      type: Sequelize.ENUM,
      values: ['primary', 'secondary'],
    },
    linkedId: {
      type: Sequelize.INTEGER,
    },
  }, {
    schema: 'contacts',
    timestamps: true,
  });

  return Contacts;
};
