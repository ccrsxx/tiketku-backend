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
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/d9b7916d-0759-4a3d-9a7d-69918cb1a0bf.jpeg',
      continent: 'ASIA'
    },
    {
      id: '947654bd-9806-4a69-a9b6-351824b45da8',
      name: 'Soekarno Hatta International',
      city: 'Jakarta',
      code: 'CGK',
      type: 'DOMESTIC',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/d4f96a6d-5048-44c1-a104-17b341109fab.jpg',
      continent: 'ASIA'
    },
    {
      id: '011cb51b-1027-429c-9819-faa163b2ded2',
      name: 'Sultan Hasanuddin International',
      city: 'Makassar',
      code: 'UPG',
      type: 'DOMESTIC',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/b3226f9d-0a9e-4cba-be23-6a99320b3289.jpg',
      continent: 'ASIA'
    },
    {
      id: '7e1d9c8c-01b3-400c-a550-99b7ac84fcfd',
      name: 'Fatmawati Soekarno',
      city: 'Bengkulu',
      code: 'BKS',
      type: 'DOMESTIC',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/02642e62-a12c-4348-b221-aa95e0ee8e7e.jpeg',
      continent: 'ASIA'
    },
    {
      id: 'c6d0564e-706a-40b5-b54f-859ad563ae98',
      name: 'Juanda International Airport',
      city: 'Surabaya',
      code: 'SUB',
      type: 'DOMESTIC',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/44225310-cf25-46c7-b9d4-dd6c6aafd096.jpeg',
      continent: 'ASIA'
    },
    {
      id: '2515393b-108d-451e-a919-2bfa2e1c336f',
      name: 'Tokyo International Airport',
      city: 'Tokyo',
      code: 'HND',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/d2c85b9e-a9a9-4cf3-b00b-f0f35ec2c0c6.jpeg',
      continent: 'ASIA'
    },
    {
      id: '9cdaed4b-6e39-45c8-8645-39b11b299f8b',
      name: 'Abu Dhabi International Airport',
      city: 'Abu Dhabi',
      code: 'AUH',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/2eb40abb-07b6-4f04-bf99-408c0e7e50cc.jpg',
      continent: 'ASIA'
    },
    {
      id: 'f5eeb781-e9cd-4550-877e-be29975a6872',
      name: 'Melbourne Airport',
      city: 'Melbourne',
      code: 'MEL',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/138e0d94-bc8d-466e-adb5-30ab3bcd6f58.jpeg',
      continent: 'AUSTRALIA'
    },
    {
      id: 'fb5cee12-7479-4a4b-8e2d-9f0b129f06e1',
      name: 'Sydney Airport',
      city: 'Sydney ',
      code: 'SYD',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/e56403c8-7bef-4cde-afa8-19019650ca2e.jpeg',
      continent: 'AUSTRALIA'
    },
    {
      id: 'be494d8a-bc14-4bad-94f9-7b9cf35a7883',
      name: 'Schiphol International Airport',
      city: 'Amsterdam',
      code: 'AMS',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/4c68bf71-0502-4bbe-a9f4-a8c13176ba64.jpeg',
      continent: 'EUROPE'
    },
    {
      id: '3c38b848-63f9-423f-8043-07272a68ee6c',
      name: 'Keflavík International Airport',
      city: 'Islandia',
      code: 'KEF',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/8cbbd031-dbb3-4232-8a6f-d7ac2d8733b5.jpeg',
      continent: 'EUROPE'
    },
    {
      id: '067b352e-478e-4bb0-a47a-d06f6b35a6bf',
      name: 'Los Angeles International Airport',
      city: 'Los Angeles',
      code: 'LAX',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/d56778bf-558b-4bc1-807a-894d1568e366.jpg',
      continent: 'AMERICA'
    },
    {
      id: '016ed705-3c3e-463d-abe9-47dfb395f07f',
      name: 'John F. Kennedy International Airport',
      city: 'New York',
      code: 'JFK',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/5d5eb117-5f5f-4264-bd4b-aa83bc329c07.jpeg',
      continent: 'AMERICA'
    },
    {
      id: '1bc1ab24-6941-4ce5-8725-918d488c6539',
      name: 'Cairo International Airport',
      city: 'Cairo',
      code: 'CAI',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/220e4e60-400c-44c3-b64a-07ec7143965a.jpg',
      continent: 'AFRICA'
    },
    {
      id: 'a12eef05-970a-467e-aeb8-c88c34e79446',
      name: 'O. R. Tambo International Airport',
      city: 'Johannesburg',
      code: 'JNB',
      type: 'INTERNATIONAL',
      image:
        'https://storage.cloud.google.com/plane-ticket-be.firebasestorage.app/public/be03360c-4aca-4068-bf8e-6d032abd6fa6.jpg',
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
