// underscore-to-camel-case.dto.ts
import { IsString, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';


export type ValidateTokenMessage = {
  status: string,
  message: String
};

export enum ErrorFormatCardInformation  {

    invalid_target = 'Numero de tajeta invalida',
    invalid_expiration_year =  'Ano de expiracion invalido',
    invalid_email = 'Email invalido',
    invalid_cvv = 'CVV invalido',
    invalid_expiration_month =  'Mes de expiracion invalido'
}

export enum StatusToken {
  valid_token = 'VALID TOKEN',
  invalid_token = 'INVALID TOKEN',
  expired_token = 'EXPIRED TOKEN'
}

export class InformationCardDTO {

  @IsNumber()
  @Transform(({ value }) => value, { toClassOnly: true })
  card_number: number;
  @IsNumber()
  @Transform(({ value }) => value, { toClassOnly: true })
  cvv: number;
  @IsString()
  @Transform(({ value }) => value, { toClassOnly: true })
  expiration_month: string;
  @IsString()
  @Transform(({ value }) => value, { toClassOnly: true })
  expiration_year: string;
  @IsString()
  @Transform(({ value }) => value, { toClassOnly: true })
  email: string;
  
}



