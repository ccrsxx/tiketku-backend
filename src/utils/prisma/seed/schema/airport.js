import { prisma } from '../../../db.js';

/** @import {Prisma} from '@prisma/client' */

export async function seedAirport() {
  /** @type {Prisma.AirportCreateInput[]} */
  const airports = [
    {
      id: 'aa224f51-f5fc-4148-9024-c973d3bce1c2',
      name: 'Yogyakarta International Airport',
      city: 'Yogyakarta',
      code: 'YIA',
      type: 'DOMESTIC',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/1c94f349-1697-4377-80a1-efdbb85b78af.jpg',
      continent: 'ASIA'
    },
    {
      id: '947654bd-9806-4a69-a9b6-351824b45da8',
      name: 'Soekarno Hatta International',
      city: 'Jakarta',
      code: 'CGK',
      type: 'DOMESTIC',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/4b1110ae-28f8-4287-97a1-408ea3916758.jpg',
      continent: 'ASIA'
    },
    {
      id: '011cb51b-1027-429c-9819-faa163b2ded2',
      name: 'Sultan Hasanuddin International',
      city: 'Makassar',
      code: 'UPG',
      type: 'DOMESTIC',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/f5119606-fd00-4257-9591-a1f6bc0a0506.jpg',
      continent: 'ASIA'
    },
    {
      id: '7e1d9c8c-01b3-400c-a550-99b7ac84fcfd',
      name: 'Fatmawati Soekarno',
      city: 'Bengkulu',
      code: 'BKS',
      type: 'DOMESTIC',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/6cb364ba-f770-435b-bd0a-5dceff41f564.jpg',
      continent: 'ASIA'
    },
    {
      id: 'c6d0564e-706a-40b5-b54f-859ad563ae98',
      name: 'Juanda International Airport',
      city: 'Surabaya',
      code: 'SUB',
      type: 'DOMESTIC',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/8ccd893d-dc0f-4b02-8a0a-a956a23577a8.jpg',
      continent: 'ASIA'
    },
    {
      id: '2515393b-108d-451e-a919-2bfa2e1c336f',
      name: 'Tokyo International Airport',
      city: 'Tokyo',
      code: 'HND',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/4809e305-1305-4b15-9f6f-0d414eab66fd.jpg',
      continent: 'ASIA'
    },
    {
      id: '9cdaed4b-6e39-45c8-8645-39b11b299f8b',
      name: 'Abu Dhabi International Airport',
      city: 'Abu Dhabi',
      code: 'AUH',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/794bd40d-6ad8-41f1-968b-bfad00408bea.jpg',
      continent: 'ASIA'
    },
    {
      id: 'f5eeb781-e9cd-4550-877e-be29975a6872',
      name: 'Melbourne Airport',
      city: 'Melbourne',
      code: 'MEL',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/7f6977f6-96db-40ad-b136-2a987c9a3bf6.jpg',
      continent: 'AUSTRALIA'
    },
    {
      id: 'fb5cee12-7479-4a4b-8e2d-9f0b129f06e1',
      name: 'Sydney Airport',
      city: 'Sydney ',
      code: 'SYD',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/f4598df7-8f8a-40ae-989c-187d96ca0b02.jpg',
      continent: 'AUSTRALIA'
    },
    {
      id: 'be494d8a-bc14-4bad-94f9-7b9cf35a7883',
      name: 'Schiphol International Airport',
      city: 'Amsterdam',
      code: 'AMS',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/3512ecb5-297a-429b-ad05-291c7cdb41fd.jpg',
      continent: 'EUROPE'
    },
    {
      id: '3c38b848-63f9-423f-8043-07272a68ee6c',
      name: 'Keflavík International Airport',
      city: 'Islandia',
      code: 'KEF',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/668f92bb-227c-4b02-9a9c-7386dded7adf.jpg',
      continent: 'EUROPE'
    },
    {
      id: '067b352e-478e-4bb0-a47a-d06f6b35a6bf',
      name: 'Los Angeles International Airport',
      city: 'Los Angeles',
      code: 'LAX',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/bca2cfa0-0921-4065-b8d9-5d2f5d4e533b.jpg',
      continent: 'AMERICA'
    },
    {
      id: '016ed705-3c3e-463d-abe9-47dfb395f07f',
      name: 'John F. Kennedy International Airport',
      city: 'New York',
      code: 'JFK',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/5263d340-1812-4153-bffc-555b03cb20f5.jpg',
      continent: 'AMERICA'
    },
    {
      id: '1bc1ab24-6941-4ce5-8725-918d488c6539',
      name: 'Cairo International Airport',
      city: 'Cairo',
      code: 'CAI',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/d981d96d-7e09-4410-8d3a-af5de20747e7.jpg',
      continent: 'AFRICA'
    },
    {
      id: 'a12eef05-970a-467e-aeb8-c88c34e79446',
      name: 'O. R. Tambo International Airport',
      city: 'Johannesburg',
      code: 'JNB',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/a2bdfcd1-5591-4605-8ed8-6e3149029995.jpg',
      continent: 'AFRICA'
    }
  ];

  for (const airport of airports) {
    await prisma.airport.upsert({
      where: { id: airport.id },
      update: {},
      create: airport
    });
  }
}
