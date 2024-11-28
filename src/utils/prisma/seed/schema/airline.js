import { prisma } from '../../../db.js';

/** @import {Prisma} from '@prisma/client' */

export async function seedAirline() {
  /** @type {Prisma.AirlineCreateInput[]} */
  const airlines = [
    {
      id: '7261dc0f-7b3f-4795-b349-18e82e69f839',
      name: 'Lion Air',
      code: 'JT',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718811494455_zqa71Kt2s.png'
    },
    {
      id: '75321628-bb7e-43d3-8113-9287db630ff3',
      name: 'Garuda Indonesia',
      code: 'GA',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718819482071_PjHwB-M9V.png'
    },
    {
      id: '56c21f50-9f45-43c2-aacb-f927b3e87af1',
      name: 'Transnusa',
      code: 'IR',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718885496878_S_V1IXWc8.jpg'
    },
    {
      id: '0e32641b-f520-486d-98f4-82de53258fdc',
      name: 'Pelita Air',
      code: '6D',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718885538249_Pja5HMVKI.png'
    },
    {
      id: '267f42e0-f0ac-4e2f-9b31-11a69088868b',
      name: 'Emirates',
      code: 'EK',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718888623939_Tnmjd1qgR.png'
    },
    {
      id: '03c22aa6-7ac1-4e2b-ad11-781a0b269deb',
      name: 'KLM Royal Dutch',
      code: 'KL',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718889525326_2LRUP6hEJ.png'
    },
    {
      id: 'd3f6bf56-1991-4466-8fa8-733cda833aaf',
      name: 'Singapore Airlines',
      code: 'SQ',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718890292869_x-qGw6rEY.png'
    },
    {
      id: '80eabbc8-9124-4f90-8d72-2b215ed01dfd',
      name: 'Citilink',
      code: 'QG',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1718978738063_QrRdk5y2P.png'
    },
    {
      id: '310c614d-df6b-4a75-b6b6-2685b155d5d3',
      name: 'Qatar Airways',
      code: 'QR',
      image: 'https://ik.imagekit.io/iaqozxfxq/IMG-1719232797186_FkjMjo5Bj.jpg'
    }
  ];

  for (const airline of airlines) {
    await prisma.airline.upsert({
      where: { id: airline.id },
      update: {},
      create: airline
    });
  }
}
