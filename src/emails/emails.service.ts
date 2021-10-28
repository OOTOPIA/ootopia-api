import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as path from 'path';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';

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
        ToAddresses: [emailTo, "virtualhacker008@gmail.com"]
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

  async sendConfirmMarketPlace (marketPlace, user) {
    let template = await this.loadTemplate("marketplace-en");
    console.log("eae tem algo?", !!user, marketPlace);
    
    let oi = Handlebars.compile(template)({marketPlace, user})

    // await fs.writeFileSync("opa.html",oi);

    return await this.sendEmail("leandro-pereira2011@hotmail.com", "OOTOPIA MARKETPLACE", oi);
  }

}