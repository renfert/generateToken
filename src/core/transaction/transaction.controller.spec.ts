import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TransactionModule } from './transaction.module';
import { InformationCardDTO, ValidateTokenMessage, ErrorFormatCardInformation } from './transaction.types';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [TransactionModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Signin', () => {
        const dto: InformationCardDTO = {
            "expiration_month": "06",
            "expiration_year": "2025",
            "email": "prueba@gmail.com",
            "cvv": 123,
            "card_number": 4111111111111111
        }
        const dtoWithInvalidCVV: InformationCardDTO = {
            "expiration_month": "06",
            "expiration_year": "2024",
            "email": "prueba@gmail.com",
            "cvv": 45,
            "card_number": 4111111111111111
        }

        const dtoWithInvalidYear: InformationCardDTO = {
            "expiration_month": "06",
            "expiration_year": "2030",
            "email": "prueba@gmail.com",
            "cvv": 4564,
            "card_number": 4111111111111111
        }

        const dtoWithInvalidCardNumber: InformationCardDTO = {
            "expiration_month": "06",
            "expiration_year": "2025",
            "email": "prueba@gmail.com",
            "cvv": 456,
            "card_number": 41111111111111115555441
        }
        let valid_token: String;
        it('should return token', async () => {
            return await request(app.getHttpServer())
                .post('/tokens')
                .send(dto)
                .set({ token: 'pk_test_123' })
                .expect(201)
                .expect(({ body }: { body: ValidateTokenMessage }) => {
                    expect(body).toBeTruthy();

                    valid_token = body.message;
                });
        });

/*
        it('correct token', async () => {
            expect(valid_token).toBeDefined(); // Ensure valid_token is defined
            const response = await request(app.getHttpServer())
              .get('/target/' + valid_token)
              .send(dto)
              .expect(200);
      
            expect(response.body.message).toBe(dto);
          });

*/
        it('should  cvv invalido', async () => {
            return await request(app.getHttpServer())
                .post('/tokens')
                .send(dtoWithInvalidCVV)
                .set({ token: 'pk_test_123' })
                .expect(201)
                .expect(({ body }: { body: ValidateTokenMessage }) => {
                    expect(body.message).toBe(ErrorFormatCardInformation.invalid_cvv);
                });
        });

        it('should  Ano de expiracion invalido', () => {
            return request(app.getHttpServer())
                .post('/tokens')
                .send(dtoWithInvalidYear)
                .set({ token: 'pk_test_123' })
                .expect(201)
                .expect(({ body }: { body: ValidateTokenMessage }) => {
                    expect(body.message).toBe(ErrorFormatCardInformation.invalid_expiration_year);
                });
        });

        it('should  Numero de tajeta invalida', () => {
            return request(app.getHttpServer())
                .post('/tokens')
                .send(dtoWithInvalidCardNumber)
                .set({ token: 'pk_test_123' })
                .expect(201)
                .expect(({ body }: { body: ValidateTokenMessage }) => {
                    expect(body.message).toBe(ErrorFormatCardInformation.invalid_target);

                });
        });

        it('should responsed with token Expired or Invalid', async () => {
            // wait for 1 second
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(true);
                }, 1200);
            });
            return request(app.getHttpServer())
                .get('/target/455555qwq123')
                .send(dto)
                .expect(200)
                .expect(({ body }: { body: ValidateTokenMessage }) => {
                    expect(body).toBeTruthy();
                });
        });
    });
});