import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; import {
  StatusToken, ErrorFormatCardInformation
} from '../transaction/transaction.types';

import { InformationCardDTO } from './transaction.types';

import { RedisService } from 'nestjs-redis';




@Injectable()
export class TransactionService {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService

  ) { }



  async signin(
    informationCard: InformationCardDTO,
    header_pk: String
  ) {

    try {
      let validateInformationCard = this.validateInformationCard(informationCard);
      if (validateInformationCard != null) {
        return {
          status: 'Invalid body data',
          message: validateInformationCard,
        }
      }
      if (this.verifyPkCommerce(header_pk) == false) {

        return {
          status: 'Invalid header data',
          message: 'Pk commerce is required',
        }
      }
      let payloadToken = {
        cardNumber: informationCard.card_number,
        date: new Date().getTime()
      }
      const token = this.generateJWT(payloadToken);
      this.saveTransactionRedis(token, informationCard)
      return {
        status: 'Token generated succesfully',
        message: token
      };

    } catch (error) {
      Logger.error(TransactionService.name, error.message);
    }
  }

  verifyPkCommerce(pkCommerce: String): boolean {
    if (pkCommerce === null || pkCommerce === undefined) {
      return false;
    }
    return pkCommerce.includes('pk_test_');

  }




  async saveTransactionRedis(id: string, data: InformationCardDTO) {
    const clientRedis = this.redisService.getClient('redis-db');
    clientRedis.on('error', err => Logger.error('Redis Client Error', err));
    await clientRedis.set(String(id), JSON.stringify(data));
  }

  async removeTransactionRedis(id: string) {
    const clientRedis = this.redisService.getClient('redis-db');
    clientRedis.on('error', err => Logger.error('Redis Client Error', err));
    await clientRedis.del(String(id));
  }

  async getTransaction(id: string) {
    const clientRedis = this.redisService.getClient('redis-db');
    clientRedis.on('error', err => Logger.error('Redis Client Error', err));
    let decode = this.decodeToken(id);
    if (decode.status == StatusToken.valid_token) {
      let data = await clientRedis.get(String(id));
      let jsonObject = JSON.parse(data);

      delete jsonObject['cvv'];
      console.log('data', jsonObject)
      return jsonObject;
    } else {
      console.log('decode', decode)

      return decode;
    }

  }



  private decodeToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      return {
        status: StatusToken.valid_token,
        message: decoded
      };
    } catch (error) {
      // Handle JWT decoding errors
      Logger.log(error);
      //removing olds token
      this.removeTransactionRedis(token)
      return {
        status: StatusToken.invalid_token,
        message: 'Token expirado o incorrecto'
      };
    }

  }

  private generateJWT(data: any) {
    const token = this.jwtService.sign(data);
    return token;
  }

  private validateInformationCard(informationCard: InformationCardDTO) {
    Logger.log(informationCard)
    if (!this.luhnCheck(informationCard.card_number.toString())) {
      return ErrorFormatCardInformation.invalid_target
    }
    if (!this.validateYear(parseInt(informationCard.expiration_year))) {
      return ErrorFormatCardInformation.invalid_expiration_year
    }
    if (!this.validateEmail(informationCard.email)) {
      return ErrorFormatCardInformation.invalid_email
    }
    if (!this.validateCVV(informationCard.cvv)) {
      return ErrorFormatCardInformation.invalid_cvv
    }
    if (!this.validateExpirationMonth(parseInt(informationCard.expiration_month))) {
      return ErrorFormatCardInformation.invalid_expiration_month
    }
    return null;
  }

  private luhnCheck(cardNumber: string): boolean {
    // Remove spaces and reverse the card number
    const reversedCardNumber = cardNumber.replace(/\s/g, '').split('').reverse().join('');
    let sum = 0;
    for (let i = 0; i < reversedCardNumber.length; i++) {
      let digit = parseInt(reversedCardNumber[i], 10);
      // Double every second digit
      if (i % 2 === 1) {
        digit *= 2;
        // If doubling results in a number greater than 9, subtract 9
        if (digit > 9) {
          digit -= 9;
        }
      }
      // Sum the digits
      sum += digit;
    }
    // The card number is valid if the sum is a multiple of 10
    return sum % 10 === 0;
  }

  private validateYear(year: number): boolean {
    if (!Number.isInteger(year)) {
      return false;
    }
    const currentYear = new Date().getFullYear();
    const maxAllowedYear = currentYear + 5;

    if (year < currentYear || year > maxAllowedYear) {
      return false;
    }

    return true;
  }

  private validateEmail(email: string): boolean {
    // Expresión regular para validar el formato del correo electrónico
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    // Lista de dominios permitidos
    const allowedDomains = ['gmail.com', 'hotmail.com', 'yahoo.es'];

    // Verificar la longitud del correo electrónico
    if (email.length > 100) {
      return false;
    }

    // Verificar el formato del correo electrónico
    if (!emailRegex.test(email)) {
      return false;
    }

    // Verificar si el dominio está permitido
    const domain = email.split('@')[1];
    if (!allowedDomains.includes(domain)) {
      return false;
    }

    // Si todas las comprobaciones pasan, el correo electrónico es válido
    return true;
  }

  private validateCVV(cvv: number): boolean {
    const cvvString = cvv.toString();
    if (cvvString.length < 3 || cvvString.length > 4) {
      return false;
    }

    return true;
  }

  private validateExpirationMonth(month: number): boolean {
    if (month < 1 || month > 12) {
      return false;
    }

    return true;
  }
}