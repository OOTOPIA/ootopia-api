import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as path from 'path';
import * as fs from 'fs';
import * as Handlebars from './handlebars';

@Injectable()
export class EmailsService {

  private ses;

  constructor() {
    this.ses = new AWS.SES({
      accessKeyId: process.env.SES_ACCESS_KEY_ID,
      secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
      region: process.env.SES_REGION,
      apiVersion: '2012-11-05'
    });
  }
  
  async sendRecoverPasswordEmail(email : string, language : string, payload : { url_recover_password : string }) {

    let templateName = "recover-password-en";
    let subject = "Recover password";

    if (language == "ptbr") {
      templateName = "recover-password-ptbr";
      subject = "Recuperar senha";
    }

    const body = this.loadTemplate(templateName);
    return this.sendEmail(email, subject, body, payload);

  }

  async sendEmail(emailTo: string, title: string, body : any, payload? : any) {
    const result = await this.ses.sendEmail({
      Source: "Ootopia app<" + process.env.SENDER_USER_EMAIL + ">",
      Destination: {
        ToAddresses: [emailTo]
      },
      Message: {
        Subject: {
          Data: (!payload ? title : Handlebars.compile(title)(payload))
        },
        Body: {
          Html: {
            Data: (!payload ? body : Handlebars.compile(body)(payload))
          }
        }
      }
    }).promise();
    console.log("SES RESPONSE", result);
    return result;
  };

  private loadTemplate(filename : string) {
    return fs.readFileSync(path.resolve(`public/templates/${filename}.html`), 'utf8');
  }

  async sendConfirmMarketPlace (marketPlace, user, seller :boolean = false) {
    let linguage = marketPlace.locale.slice(0,2);
    let title = linguage == 'pt' ? "MERCADO ÉTICO OOTOPIA" : "ETHICAL MARKETPLACE OOTOPIA";
    let destination = seller ? marketPlace.user.email : user.email;

    if (destination == 'luize@ootopia.org') {
      return
    }

    let template = await this.loadTemplate(`marketplace-${linguage}`);
    let contemplated = seller ? user : marketPlace.user;

    let page = Handlebars.compile(template)({marketPlace, user: contemplated, seller : seller});

    return await this.sendEmail(destination, title, page);
  }

}