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
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718886705943_ht2QKyRGM.jpg',
      continent: 'ASIA'
    },
    {
      id: '947654bd-9806-4a69-a9b6-351824b45da8',
      name: 'Soekarno Hatta International',
      city: 'Jakarta',
      code: 'CGK',
      type: 'DOMESTIC',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718888358211_jRGb4UMuu.jpg',
      continent: 'ASIA'
    },
    {
      id: '011cb51b-1027-429c-9819-faa163b2ded2',
      name: 'Sultan Hasanuddin International',
      city: 'Makassar',
      code: 'UPG',
      type: 'DOMESTIC',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718978705711_FNExtTfDv.jpg',
      continent: 'ASIA'
    },
    {
      id: '7e1d9c8c-01b3-400c-a550-99b7ac84fcfd',
      name: 'Fatmawati Soekarno',
      city: 'Bengkulu',
      code: 'BKS',
      image:
        'https://ik.imagekit.io/iaqozxfxq/IMG-1719062019111_b1PBlRDVt.jpeg',
      type: 'DOMESTIC',
      continent: 'ASIA'
    },
    {
      id: 'c6d0564e-706a-40b5-b54f-859ad563ae98',
      name: 'Juanda International Airport',
      city: 'Surabaya',
      code: ' SUB',
      type: 'DOMESTIC',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718980610773_dJe8eKzOS.jpg',
      continent: 'ASIA'
    },
    {
      id: '2515393b-108d-451e-a919-2bfa2e1c336f',
      type: 'INTERNATIONAL',
      code: 'HND',
      name: 'Tokyo International Airport',
      city: 'Tokyo',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718888434678_0C9pPslPg.jpg',
      continent: 'ASIA'
    },
    {
      name: 'Abu Dhabi International Airport',
      city: 'Abu Dhabi',
      code: 'AUH',
      type: 'INTERNATIONAL',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718888434678_0C9pPslPg.jpg',
      continent: 'ASIA',
      id: '9cdaed4b-6e39-45c8-8645-39b11b299f8b'
    },
    {
      id: 'f5eeb781-e9cd-4550-877e-be29975a6872',
      name: 'Melbourne Airport',
      city: 'Melbourne ',
      code: 'MEL',
      type: 'INTERNATIONAL',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718888434678_0C9pPslPg.jpg',
      continent: 'AUSTRALIA'
    },
    {
      id: 'fb5cee12-7479-4a4b-8e2d-9f0b129f06e1',
      name: 'Sydney Airport',
      city: 'Sydney ',
      code: 'SYD',
      type: 'INTERNATIONAL',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718888434678_0C9pPslPg.jpg',
      continent: 'AUSTRALIA'
    },
    {
      id: 'be494d8a-bc14-4bad-94f9-7b9cf35a7883',
      name: 'Schiphol',
      city: 'Amsterdam',
      code: 'AMS',
      type: 'INTERNATIONAL',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718888482824_PieEd39tA.jpg',
      continent: 'EUROPE'
    },
    {
      id: '3c38b848-63f9-423f-8043-07272a68ee6c',
      name: 'Keflavík International Airport',
      city: 'Islandia',
      code: 'KEF',
      image:
        'https://ik.imagekit.io/iaqozxfxq/IMG-1719233019681_xhFetRhU_.jfif',
      type: 'INTERNATIONAL',
      continent: 'EUROPE'
    },
    {
      id: '067b352e-478e-4bb0-a47a-d06f6b35a6bf',
      name: 'Los Angeles International Airport',
      city: 'Los Angeles',
      code: 'LAX',
      type: 'INTERNATIONAL',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718888534393_NHshwCyEx.jpg',
      continent: 'AMERICA'
    },
    {
      id: '016ed705-3c3e-463d-abe9-47dfb395f07f',
      name: 'John F. Kennedy International Airport',
      city: 'New York',
      code: 'JFK',
      type: 'INTERNATIONAL',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718888534393_NHshwCyEx.jpg',
      continent: 'AMERICA'
    },
    {
      id: '1bc1ab24-6941-4ce5-8725-918d488c6539',
      name: 'Cairo International Airport',
      city: 'Cairo',
      code: 'CAI',
      image:
        'https://ik.imagekit.io/iaqozxfxq/IMG-1719235677604_frD8aGuyG.jfif',
      type: 'INTERNATIONAL',
      continent: 'AFRICA'
    },
    {
      id: 'a12eef05-970a-467e-aeb8-c88c34e79446',
      name: 'O. R. Tambo International Airport',
      city: 'Johannesburg',
      code: 'JNB',
      image:
        'https://ik.imagekit.io/iaqozxfxq/IMG-1719235677604_frD8aGuyG.jfif',
      type: 'INTERNATIONAL',
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
