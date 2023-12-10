import Model from './model.js';

export default class User extends Model {
    constructor()
    {
        super();
        this.addField('Name', 'string');
        this.addField('Email', 'email');        
        this.addField('Password', 'string');
        this.addField('Avatar', 'asset');
        this.addField('Created','integer');
        this.addField('VerifyCode','string');
        this.addField('Authorizations','object');

        this.setKey("Email");
    }

    bindExtraData(instance) {
        instance = super.bindExtraData(instance);
        instance.Password = "************";
        if (instance.VerifyCode !== "verified") instance.VerifyCode = "unverified";
        instance.isBlocked = instance.Authorizations.readAccess == -1;
        instance.isAdmin = instance.Authorizations.readAccess == 2 && instance.Authorizations.writeAccess == 2;
        return instance;
    }
}