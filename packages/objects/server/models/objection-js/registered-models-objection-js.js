/**
 *
 * Reldens - Registered Entities
 *
 */

const { ObjectsAnimationsModel } = require('./animations-model');
const { ObjectsModel } = require('./objects-model');
const { ObjectsAssetsModel } = require('./assets-model');
const { entitiesTranslations } = require('../../entities-translations');
const { entitiesConfig } = require('../../entiites-config');

let rawRegisteredEntities = {
    objectsAnimations: ObjectsAnimationsModel,
    objectsModel: ObjectsModel,
    objectsAssets: ObjectsAssetsModel
};

module.exports.rawRegisteredEntities = rawRegisteredEntities;

module.exports.entitiesConfig = entitiesConfig;

module.exports.entitiesTranslations = entitiesTranslations;
