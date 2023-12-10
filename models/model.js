/////////////////////////////////////////////////////////////////////
// This class provide a model scheme
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////
import * as AssetsRepository from '../assetsManager.js';
export default class Model {
    constructor() {
        this.fields = [];
        this.addField('Id', 'object');
        this.key = null;
        this.state = { isValid: true, inConflict: false, notFound: false, errors: [] };
    }
    addField(propertyName, propertyType) {
        this.fields.push({ name: propertyName, type: propertyType });
    }
    isMember(propertyName) {
        let exist = false;
        this.fields.forEach(field => {
            if (field.name == propertyName)
                exist = true;
        })
        return exist;
    }
    setKey(key) {
        this.key = key;
    }
    getClassName() {
        return this.constructor.name;
    }
    valueValid(value, type) {
        if (value !== null) {
            switch (type) {
                case "string": return true;
                case "stringNotEmpty": return value != "";
                case "integer": return parseInt(value) != NaN;
                case "float": return parseFloat(value) != NaN;
                case "boolean": return value === false || value === true;
                case "alpha": return /^[a-zA-Z\- 'ààâäæáãåāèéêëęėēîïīįíìôōøõóòöœùûüūúÿçćčńñÀÂÄÆÁÃÅĀÈÉÊËĘĖĒÎÏĪĮÍÌÔŌØÕÓÒÖŒÙÛÜŪÚŸÇĆČŃÑ]*$/.test(value);
                case "phone": return /^\(\d\d\d\) \d\d\d-\d\d\d\d$/.test(value);
                case "email": return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value);
                case "url": return /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/.test(value);
                case "zipcode": return /^[a-zA-Z][0-9]+[a-zA-Z]\s[0-9]+[a-zA-Z][0-9]+$/.test(value);
                case "object": return true;
                case "asset": return true; // todo verify if it's a blob
                default: return false;
            }
        }
        return false;
    }
    addError(message) {
        this.state.isValid = false;
        this.state.errors.push(message);
    }
    validate(instance) {
        this.fields.forEach(field => {
            if (!(field.name in instance)) {
                this.addError(`The property [${field.name}] is missing...`);
            } else {
                if (!this.valueValid(instance[field.name], field.type))
                    this.addError(`The property [${field.name}] value must be a valid ${field.type} ...`);
            }
            if (this.state.isValid)
                this.stringToType(instance, field.name, field.type);
        });
    }
    stringToType(instance, fieldName, type) {
        if (instance[fieldName] !== null) {
            switch (type) {
                case "integer": instance[fieldName] = parseInt(instance[fieldName]); break;
                case "float": instance[fieldName] = parseFloat(instance[fieldName]); break;
            }
        }
    }
    handleAssets(instance, storedInstance = null) {
        this.fields.forEach(field => {
            if ((field.name in instance) && (field.type == "asset")) {
                if (instance[field.name] == '') {
                    if (storedInstance != null) {
                        instance[field.name] = storedInstance[field.name];
                    }
                } else {
                    if (storedInstance != null) {
                        if (instance[field.name] != storedInstance[field.name]) {
                            instance[field.name] = AssetsRepository.save(instance[field.name]);
                            AssetsRepository.remove(storedInstance[field.name]);
                        }
                    } else {
                        instance[field.name] = AssetsRepository.save(instance[field.name]);
                    }
                }
            }
        });
    }
    removeAssets(instance) {
        this.fields.forEach(field => {
            if ((field.name in instance) && (field.type == "asset")) {
                AssetsRepository.remove(instance[field.name]);
            }
        });
    }
    addHostReferenceToAssetFileNames(instance) {
        this.fields.forEach(field => {
            if ((field.name in instance) && (field.type == "asset")) {
                instance[field.name] = AssetsRepository.addHostReference(instance[field.name]);
            }
        });
    }
    bindExtraData(instance) {
        let instanceCopy = { ...instance };
        this.addHostReferenceToAssetFileNames(instanceCopy);
        return instanceCopy;
    }
}