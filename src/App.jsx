import React, { useState, useEffect, useMemo, useCallback } from "react";
import { storage } from "./storage.js";
import PinGate from "./PinGate.jsx";
import {
  Plus,
  Trash2,
  AlertTriangle,
  Layers,
  X,
  ChevronRight,
  ChevronDown,
  Mail,
} from "lucide-react";

/* ---------------------------------------------------------
   Price Designs — Shop Inventory
   Tokens
   bg canvas   #17181a
   bg surface  #1f2124
   bg raised   #26282c
   hairline    #35373b
   text hi     #ece9e2   (billet aluminum)
   text lo     #8d9096
   accent      #3d7ea6   (anodize blue)  -> "on order, not yet in production"
   warn        #e8963c   (safety amber)  -> "in production"
   danger      #c0503a   (shop red)      -> "below threshold"
--------------------------------------------------------- */

const FONT_LINK_ID = "pd-inventory-fonts";

function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

const MACHINED_CATEGORIES = ["Wheel Centers", "Beadlock Rings", "Center Caps"];

const MATERIAL_CATEGORIES = ["Materials", "Forgings", "Barrels", "Hardware"];

const uid = () => Math.random().toString(36).slice(2, 9);

const SEED_MACHINED = [
  {
    id: "m1",
    category: "Wheel Centers",
    name: '15” Galaxy 5x114.3',
    partNumber: "PRG15",
    onHand: 8,
    threshold: 12,
    orders: [{ id: uid(), qty: 20, datePlaced: "2026-08-10", inProduction: true }],
    notes: "",
  },
  {
    id: "m2",
    category: "Wheel Centers",
    name: '17” Nebula 5x127',
    partNumber: "PRN17",
    onHand: 15,
    threshold: 10,
    orders: [],
    notes: "",
  },
  {
    id: "m3",
    category: "Wheel Centers",
    name: '20” Orion 5x150',
    partNumber: "PRO20",
    onHand: 5,
    threshold: 8,
    orders: [{ id: uid(), qty: 15, datePlaced: "2026-08-05", inProduction: false }],
    notes: "",
  },
  {
    id: "m4",
    category: "Wheel Centers",
    name: '15” Comet 5x114.3',
    partNumber: "PRC15",
    onHand: 22,
    threshold: 12,
    orders: [],
    notes: "",
  },
  {
    id: "m5",
    category: "Wheel Centers",
    name: '18” Vortex 6x139.7',
    partNumber: "PRV18",
    onHand: 9,
    threshold: 10,
    orders: [{ id: uid(), qty: 10, datePlaced: "2026-08-11", inProduction: true }],
    notes: "",
  },
  {
    id: "m6",
    category: "Wheel Centers",
    name: '20” Eclipse 8x170',
    partNumber: "PRE20",
    onHand: 3,
    threshold: 6,
    orders: [{ id: uid(), qty: 20, datePlaced: "2026-08-12", inProduction: true }],
    notes: "",
  },
  {
    id: "m7",
    category: "Wheel Centers",
    name: '17” Meteor 5x139.7',
    partNumber: "PRM17",
    onHand: 18,
    threshold: 10,
    orders: [],
    notes: "",
  },
  {
    id: "m8",
    category: "Wheel Centers",
    name: '16” Solstice 6x135',
    partNumber: "PRS16",
    onHand: 7,
    threshold: 8,
    orders: [{ id: uid(), qty: 12, datePlaced: "2026-08-09", inProduction: false }],
    notes: "",
  },
  {
    id: "m9",
    category: "Wheel Centers",
    name: '20” Titan 8x180',
    partNumber: "PRT20",
    onHand: 30,
    threshold: 15,
    orders: [],
    notes: "",
  },
  {
    id: "m10",
    category: "Wheel Centers",
    name: '15” Zenith 5x127',
    partNumber: "PRZ15",
    onHand: 4,
    threshold: 10,
    orders: [{ id: uid(), qty: 25, datePlaced: "2026-08-13", inProduction: true }],
    notes: "",
  },
  {
    id: "m11",
    category: "Wheel Centers",
    name: '18” Apex 6x139.7',
    partNumber: "PRA18",
    onHand: 14,
    threshold: 10,
    orders: [],
    notes: "",
  },
  {
    id: "b1",
    category: "Beadlock Rings",
    name: '15” Sawblade UTV',
    partNumber: "15SB-BL",
    onHand: 8,
    threshold: 10,
    orders: [],
    notes: "",
  },
  {
    id: "b2",
    category: "Beadlock Rings",
    name: '17” Sawblade UTV',
    partNumber: "17SB-BL",
    onHand: 16,
    threshold: 10,
    orders: [],
    notes: "",
  },
  {
    id: "b3",
    category: "Beadlock Rings",
    name: '15” Diamond UTV',
    partNumber: "15DM-BL",
    onHand: 6,
    threshold: 10,
    orders: [{ id: uid(), qty: 18, datePlaced: "2026-08-06", inProduction: true }],
    notes: "",
  },
  {
    id: "b4",
    category: "Beadlock Rings",
    name: '17” Diamond UTV',
    partNumber: "17DM-BL",
    onHand: 20,
    threshold: 10,
    orders: [],
    notes: "",
  },
  {
    id: "b5",
    category: "Beadlock Rings",
    name: '15” Recon UTV',
    partNumber: "15RC-BL",
    onHand: 4,
    threshold: 8,
    orders: [{ id: uid(), qty: 16, datePlaced: "2026-08-12", inProduction: false }],
    notes: "",
  },
  {
    id: "b6",
    category: "Beadlock Rings",
    name: '17” Recon UTV',
    partNumber: "17RC-BL",
    onHand: 11,
    threshold: 8,
    orders: [],
    notes: "",
  },
  {
    id: "b7",
    category: "Beadlock Rings",
    name: '20” Recon Truck',
    partNumber: "20RC-BL",
    onHand: 2,
    threshold: 6,
    orders: [{ id: uid(), qty: 10, datePlaced: "2026-08-13", inProduction: true }],
    notes: "",
  },
  {
    id: "b8",
    category: "Beadlock Rings",
    name: '15” Warrior UTV',
    partNumber: "15WR-BL",
    onHand: 13,
    threshold: 10,
    orders: [],
    notes: "",
  },
  {
    id: "b9",
    category: "Beadlock Rings",
    name: '17” Warrior UTV',
    partNumber: "17WR-BL",
    onHand: 9,
    threshold: 10,
    orders: [{ id: uid(), qty: 12, datePlaced: "2026-08-08", inProduction: false }],
    notes: "",
  },
  {
    id: "b10",
    category: "Beadlock Rings",
    name: '20” Warrior Truck',
    partNumber: "20WR-BL",
    onHand: 24,
    threshold: 12,
    orders: [],
    notes: "",
  },
  {
    id: "c1",
    category: "Center Caps",
    name: '3” Center Cap UTV',
    partNumber: "3CC-UTV",
    onHand: 6,
    threshold: 40,
    orders: [],
    notes: "",
  },
  {
    id: "c2",
    category: "Center Caps",
    name: '4” Center Cap UTV',
    partNumber: "4CC-UTV",
    onHand: 55,
    threshold: 40,
    orders: [],
    notes: "",
  },
  {
    id: "c3",
    category: "Center Caps",
    name: '3” Center Cap Truck',
    partNumber: "3CC-TRK",
    onHand: 18,
    threshold: 30,
    orders: [{ id: uid(), qty: 50, datePlaced: "2026-08-11", inProduction: true }],
    notes: "",
  },
  {
    id: "c4",
    category: "Center Caps",
    name: '4” Center Cap Truck',
    partNumber: "4CC-TRK",
    onHand: 42,
    threshold: 30,
    orders: [],
    notes: "",
  },
  {
    id: "c5",
    category: "Center Caps",
    name: '5” Center Cap Truck',
    partNumber: "5CC-TRK",
    onHand: 10,
    threshold: 25,
    orders: [{ id: uid(), qty: 40, datePlaced: "2026-08-13", inProduction: false }],
    notes: "",
  },
  {
    id: "c6",
    category: "Center Caps",
    name: '3” Center Cap Beadlock',
    partNumber: "3CC-BL",
    onHand: 60,
    threshold: 40,
    orders: [],
    notes: "",
  },
];

const SEED_MATERIALS = [
  {
    id: "mt1",
    category: "Materials",
    name: "15-17 Ring Material",
    partNumber: "19x19x.75 Plate",
    onHand: 40,
    threshold: 40,
    orders: [],
    pricePerUnit: 185,
    supplier: "IMS Metals",
    supplierContact: "Francisca / fbravo@imsmetals.com",
    notes: "",
  },
  {
    id: "mt2",
    category: "Materials",
    name: "17-20 Ring Material",
    partNumber: "22x22x.75 Plate",
    onHand: 28,
    threshold: 40,
    orders: [{ id: uid(), qty: 20, datePlaced: "2026-08-10", inProduction: false }],
    pricePerUnit: 240,
    supplier: "IMS Metals",
    supplierContact: "Francisca / fbravo@imsmetals.com",
    notes: "",
  },
  {
    id: "mt3",
    category: "Materials",
    name: "20-22 Ring Material",
    partNumber: "24x24x.75 Plate",
    onHand: 45,
    threshold: 35,
    orders: [],
    pricePerUnit: 285,
    supplier: "IMS Metals",
    supplierContact: "Francisca / fbravo@imsmetals.com",
    notes: "",
  },
  {
    id: "mt4",
    category: "Materials",
    name: "15-17 Center Material",
    partNumber: "17x17x1.5 Plate",
    onHand: 18,
    threshold: 25,
    orders: [{ id: uid(), qty: 24, datePlaced: "2026-08-12", inProduction: true }],
    pricePerUnit: 310,
    supplier: "IMS Metals",
    supplierContact: "Francisca / fbravo@imsmetals.com",
    notes: "",
  },
  {
    id: "mt5",
    category: "Materials",
    name: "17-20 Center Material",
    partNumber: "20x20x1.5 Plate",
    onHand: 30,
    threshold: 25,
    orders: [],
    pricePerUnit: 355,
    supplier: "IMS Metals",
    supplierContact: "Francisca / fbravo@imsmetals.com",
    notes: "",
  },
  {
    id: "mt6",
    category: "Materials",
    name: "20-22 Center Material",
    partNumber: "22x22x1.5 Plate",
    onHand: 12,
    threshold: 20,
    orders: [{ id: uid(), qty: 18, datePlaced: "2026-08-13", inProduction: false }],
    pricePerUnit: 405,
    supplier: "IMS Metals",
    supplierContact: "Francisca / fbravo@imsmetals.com",
    notes: "",
  },
  {
    id: "mt7",
    category: "Materials",
    name: "15-17 Cap Material",
    partNumber: "5x5x.5 Plate",
    onHand: 60,
    threshold: 50,
    orders: [],
    pricePerUnit: 22,
    supplier: "IMS Metals",
    supplierContact: "Francisca / fbravo@imsmetals.com",
    notes: "",
  },
  {
    id: "mt8",
    category: "Materials",
    name: "17-20 Cap Material",
    partNumber: "6x6x.5 Plate",
    onHand: 38,
    threshold: 50,
    orders: [{ id: uid(), qty: 30, datePlaced: "2026-08-11", inProduction: true }],
    pricePerUnit: 28,
    supplier: "IMS Metals",
    supplierContact: "Francisca / fbravo@imsmetals.com",
    notes: "",
  },
  {
    id: "mt9",
    category: "Materials",
    name: "15-17 Barrel Stock",
    partNumber: "17x17x3 Billet",
    onHand: 9,
    threshold: 15,
    orders: [],
    pricePerUnit: 520,
    supplier: "IMS Metals",
    supplierContact: "Francisca / fbravo@imsmetals.com",
    notes: "",
  },
  {
    id: "mt10",
    category: "Materials",
    name: "20-22 Barrel Stock",
    partNumber: "22x22x3 Billet",
    onHand: 6,
    threshold: 12,
    orders: [{ id: uid(), qty: 10, datePlaced: "2026-08-13", inProduction: false }],
    pricePerUnit: 610,
    supplier: "IMS Metals",
    supplierContact: "Francisca / fbravo@imsmetals.com",
    notes: "",
  },
  {
    id: "f1",
    category: "Forgings",
    name: '15” UTV Wheel Center',
    partNumber: "15WC001S",
    onHand: 0,
    threshold: 0,
    orders: [],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "f2",
    category: "Forgings",
    name: '17” UTV Wheel Center',
    partNumber: "17WC001S",
    onHand: 0,
    threshold: 0,
    orders: [],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "br1",
    category: "Barrels",
    name: '15x8 Beadlock Barrel 5.5+2.5',
    partNumber: "1580552520-BL",
    onHand: 12,
    threshold: 15,
    orders: [{ id: uid(), qty: 20, datePlaced: "2026-08-10", inProduction: true }],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "br2",
    category: "Barrels",
    name: '15x9 Beadlock Barrel 5.0+4.0',
    partNumber: "1590502020-BL",
    onHand: 20,
    threshold: 15,
    orders: [],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "br3",
    category: "Barrels",
    name: '15x10 Beadlock Barrel 5.5+4.5',
    partNumber: "15100554520-BL",
    onHand: 6,
    threshold: 12,
    orders: [{ id: uid(), qty: 15, datePlaced: "2026-08-11", inProduction: false }],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "br4",
    category: "Barrels",
    name: '17x8 Beadlock Barrel 4.5+3.5',
    partNumber: "1780452020-BL",
    onHand: 18,
    threshold: 15,
    orders: [],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "br5",
    category: "Barrels",
    name: '17x9 Beadlock Barrel 5.0+4.0',
    partNumber: "1790502020-BL",
    onHand: 9,
    threshold: 12,
    orders: [{ id: uid(), qty: 12, datePlaced: "2026-08-12", inProduction: true }],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "br6",
    category: "Barrels",
    name: '17x10 Beadlock Barrel 5.5+4.5',
    partNumber: "17100554520-BL",
    onHand: 14,
    threshold: 12,
    orders: [],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "br7",
    category: "Barrels",
    name: '20x8 Beadlock Barrel 4.0+4.0',
    partNumber: "2080402020-BL",
    onHand: 3,
    threshold: 10,
    orders: [{ id: uid(), qty: 12, datePlaced: "2026-08-13", inProduction: true }],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "br8",
    category: "Barrels",
    name: '20x9 Beadlock Barrel 4.5+4.5',
    partNumber: "2090452020-BL",
    onHand: 11,
    threshold: 10,
    orders: [],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "br9",
    category: "Barrels",
    name: '20x10 Beadlock Barrel 5.0+5.0',
    partNumber: "20100505020-BL",
    onHand: 5,
    threshold: 8,
    orders: [{ id: uid(), qty: 10, datePlaced: "2026-08-09", inProduction: false }],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "br10",
    category: "Barrels",
    name: '15x7 Beadlock Barrel 3.5+3.5',
    partNumber: "1570352020-BL",
    onHand: 22,
    threshold: 15,
    orders: [],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "br11",
    category: "Barrels",
    name: '17x7 Beadlock Barrel 3.5+3.5',
    partNumber: "1770352020-BL",
    onHand: 16,
    threshold: 15,
    orders: [],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "br12",
    category: "Barrels",
    name: '15x8 Beadlock Barrel 4.0+4.0',
    partNumber: "1580402020-BL",
    onHand: 8,
    threshold: 15,
    orders: [{ id: uid(), qty: 18, datePlaced: "2026-08-08", inProduction: false }],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "br13",
    category: "Barrels",
    name: '17x8 Beadlock Barrel 5.0+3.0',
    partNumber: "1780502020-BL",
    onHand: 13,
    threshold: 12,
    orders: [],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "br14",
    category: "Barrels",
    name: '20x9 Beadlock Barrel 5.5+3.5',
    partNumber: "2090552020-BL",
    onHand: 2,
    threshold: 10,
    orders: [{ id: uid(), qty: 12, datePlaced: "2026-08-12", inProduction: true }],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "hw1",
    category: "Hardware",
    name: "M8x1.25x32 Assembly Bolt Black",
    partNumber: "M812532BLK",
    onHand: 1000,
    threshold: 1000,
    orders: [],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "hw2",
    category: "Hardware",
    name: "M8x1.25x32 Assembly Bolt Chrome",
    partNumber: "M812532CHR",
    onHand: 850,
    threshold: 1000,
    orders: [{ id: uid(), qty: 500, datePlaced: "2026-08-11", inProduction: false }],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "hw3",
    category: "Hardware",
    name: "M8x1.25x32 Assembly Bolt Black Chrome",
    partNumber: "M812532BCH",
    onHand: 1200,
    threshold: 1000,
    orders: [],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "hw4",
    category: "Hardware",
    name: "M8x1.25x32 Assembly Bolt Gray",
    partNumber: "M812532GRY",
    onHand: 600,
    threshold: 1000,
    orders: [{ id: uid(), qty: 500, datePlaced: "2026-08-12", inProduction: true }],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "hw5",
    category: "Hardware",
    name: "M8x1.25x32 Assembly Bolt Light Neochrome",
    partNumber: "M812532LNC",
    onHand: 400,
    threshold: 750,
    orders: [{ id: uid(), qty: 500, datePlaced: "2026-08-13", inProduction: true }],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "hw6",
    category: "Hardware",
    name: "M8x1.25x32 Assembly Bolt Dark Neochrome",
    partNumber: "M812532DNC",
    onHand: 720,
    threshold: 750,
    orders: [],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "hw7",
    category: "Hardware",
    name: "M8x1.25x32 Assembly Bolt Red",
    partNumber: "M812532RED",
    onHand: 300,
    threshold: 500,
    orders: [{ id: uid(), qty: 300, datePlaced: "2026-08-10", inProduction: false }],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "hw8",
    category: "Hardware",
    name: "M8x1.25x32 Assembly Bolt Gold",
    partNumber: "M812532GLD",
    onHand: 480,
    threshold: 500,
    orders: [],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "hw9",
    category: "Hardware",
    name: "M8x1.25x32 Assembly Bolt Rose Gold",
    partNumber: "M812532RGD",
    onHand: 150,
    threshold: 500,
    orders: [{ id: uid(), qty: 350, datePlaced: "2026-08-13", inProduction: true }],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "hw10",
    category: "Hardware",
    name: "M8x1.25x32 Assembly Bolt Blue",
    partNumber: "M812532BLU",
    onHand: 550,
    threshold: 500,
    orders: [],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "hw11",
    category: "Hardware",
    name: "M8x1.25x32 Assembly Bolt Pink",
    partNumber: "M812532PNK",
    onHand: 200,
    threshold: 400,
    orders: [{ id: uid(), qty: 250, datePlaced: "2026-08-09", inProduction: false }],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
  {
    id: "hw12",
    category: "Hardware",
    name: "M8x1.25x32 Assembly Bolt Purple",
    partNumber: "M812532PUR",
    onHand: 380,
    threshold: 400,
    orders: [],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  },
];

async function loadList(key, seed) {
  try {
    const res = await storage.get(key);
    if (res && res.value) return JSON.parse(res.value);
    return seed;
  } catch {
    return seed;
  }
}
async function saveList(key, list) {
  try {
    await storage.set(key, JSON.stringify(list));
  } catch (e) {
    console.error("Storage save failed", e);
  }
}

/* ---------- shared bits ---------- */

function CornerTag({ children, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute -top-px -left-px w-2 h-2 border-t border-l" style={{ borderColor: "#3d7ea6" }} />
      <span className="absolute -top-px -right-px w-2 h-2 border-t border-r" style={{ borderColor: "#3d7ea6" }} />
      <span className="absolute -bottom-px -left-px w-2 h-2 border-b border-l" style={{ borderColor: "#3d7ea6" }} />
      <span className="absolute -bottom-px -right-px w-2 h-2 border-b border-r" style={{ borderColor: "#3d7ea6" }} />
      {children}
    </div>
  );
}

function StatCard({ label, value, accent, icon: Icon }) {
  return (
    <CornerTag className="px-5 py-4">
      <div className="flex items-center justify-between" style={{ fontFamily: "Inter, sans-serif" }}>
        <div>
          <div className="text-[11px] tracking-[0.15em] uppercase" style={{ color: "#8d9096" }}>{label}</div>
          <div
            className="text-3xl mt-1"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", color: accent || "#ece9e2", fontWeight: 600 }}
          >
            {value}
          </div>
        </div>
        {Icon && <Icon size={20} style={{ color: accent || "#8d9096" }} />}
      </div>
    </CornerTag>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="block text-[11px] tracking-[0.1em] uppercase mb-1" style={{ color: "#8d9096", fontFamily: "Inter, sans-serif" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle = {
  backgroundColor: "#1a1c1f",
  border: "1px solid #35373b",
  color: "#ece9e2",
  fontFamily: "Inter, sans-serif",
};

function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
}

/* ---------- Order chips (machined "On Order" column) ---------- */

function OrderChips({ orders }) {
  if (!orders || orders.length === 0) {
    return <span style={{ color: "#4a4d52" }}>—</span>;
  }
  return (
    <div className="flex flex-col gap-1 items-end">
      {orders.map((o) => (
        <span
          key={o.id}
          className="text-xs font-mono px-2 py-0.5 whitespace-nowrap"
          style={{
            backgroundColor: o.inProduction ? "rgba(232,150,60,0.16)" : "rgba(61,126,166,0.14)",
            color: o.inProduction ? "#e8963c" : "#6fa8c9",
            border: `1px solid ${o.inProduction ? "#e8963c" : "#3d7ea6"}`,
          }}
        >
          {o.qty} · {fmtDate(o.datePlaced) || "no date"}
        </span>
      ))}
    </div>
  );
}

/* ---------- Attention panel ---------- */

function AttentionPanel({ items, kind, onJump }) {
  const [open, setOpen] = useState(true);
  if (items.length === 0) return null;

  return (
    <div className="mb-6" style={{ border: "1px solid #c0503a", backgroundColor: "rgba(192,80,58,0.07)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} style={{ color: "#c0503a" }} />
          <span
            className="text-sm tracking-wide uppercase"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#e8b8ab" }}
          >
            {items.length} {items.length === 1 ? "item needs" : "items need"} attention
          </span>
        </div>
        {open ? <ChevronDown size={16} style={{ color: "#8d9096" }} /> : <ChevronRight size={16} style={{ color: "#8d9096" }} />}
      </button>
      {open && (
        <div style={{ borderTop: "1px solid rgba(192,80,58,0.3)" }}>
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => onJump(it)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors"
              style={{ borderBottom: "1px solid rgba(192,80,58,0.15)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(192,80,58,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div style={{ fontFamily: "Inter, sans-serif" }}>
                <span style={{ color: "#ece9e2" }} className="text-sm">{it.name}</span>
                <span className="text-xs font-mono ml-2" style={{ color: "#8d9096" }}>{it.partNumber}</span>
              </div>
              <span className="text-xs font-mono" style={{ color: "#c0503a" }}>
                {it.onHand} on hand · needs {it.threshold}
              </span>
            </button>
          ))}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ backgroundColor: "#1a1c1f" }}
          >
            <span className="text-xs" style={{ color: "#6b6e73", fontFamily: "Inter, sans-serif" }}>
              Next up: auto-email this list to you
            </span>
            <button
              disabled
              title="Automation coming soon"
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 opacity-40 cursor-not-allowed"
              style={{ border: "1px solid #8d9096", color: "#8d9096", fontFamily: "Inter, sans-serif" }}
            >
              <Mail size={12} /> Email order list
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Orders editor (inside item modal) ---------- */

function OrdersEditor({ orders, onChange }) {
  const update = (id, patch) =>
    onChange(orders.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const remove = (id) => onChange(orders.filter((o) => o.id !== id));
  const add = () =>
    onChange([...orders, { id: uid(), qty: 0, datePlaced: "", inProduction: false }]);

  return (
    <div className="mb-3">
      <span className="block text-[11px] tracking-[0.1em] uppercase mb-2" style={{ color: "#8d9096", fontFamily: "Inter, sans-serif" }}>
        On Order
      </span>
      <div className="flex flex-col gap-2">
        {orders.map((o) => (
          <div key={o.id} className="flex items-center gap-2" style={{ border: "1px solid #35373b", padding: "6px 8px" }}>
            <input
              type="number"
              value={o.qty}
              onChange={(e) => update(o.id, { qty: Number(e.target.value) })}
              className="w-16 px-2 py-1 text-sm font-mono"
              style={inputStyle}
              placeholder="Qty"
            />
            <input
              type="date"
              value={o.datePlaced}
              onChange={(e) => update(o.id, { datePlaced: e.target.value })}
              className="flex-1 px-2 py-1 text-sm"
              style={inputStyle}
            />
            <label className="flex items-center gap-1.5 text-xs whitespace-nowrap" style={{ color: "#8d9096", fontFamily: "Inter, sans-serif" }}>
              <input
                type="checkbox"
                checked={o.inProduction}
                onChange={(e) => update(o.id, { inProduction: e.target.checked })}
              />
              In production
            </label>
            <button onClick={() => remove(o.id)} aria-label="Remove order">
              <X size={14} style={{ color: "#8d9096" }} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-xs mt-2 px-2.5 py-1.5"
        style={{ border: "1px dashed #35373b", color: "#8d9096", fontFamily: "Inter, sans-serif" }}
      >
        <Plus size={12} /> Add order
      </button>
    </div>
  );
}

/* ---------- Item modal ---------- */

function ItemModal({ open, onClose, onSave, onDelete, initial, categories, showSupplierFields }) {
  const blank = {
    category: categories[0],
    name: "",
    partNumber: "",
    onHand: 0,
    threshold: 0,
    orders: [],
    pricePerUnit: 0,
    supplier: "",
    supplierContact: "",
    notes: "",
  };

  const [form, setForm] = useState(initial || blank);

  useEffect(() => {
    setForm(initial || blank);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, open]);

  if (!open) return null;

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(10,10,11,0.72)" }}>
      <div className="w-full max-w-lg max-h-[88vh] overflow-y-auto" style={{ backgroundColor: "#1f2124", border: "1px solid #35373b" }}>
        <div className="flex items-center justify-between px-5 py-4 sticky top-0" style={{ backgroundColor: "#1f2124", borderBottom: "1px solid #35373b" }}>
          <h2 className="text-xl tracking-wide" style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "#ece9e2", fontWeight: 600 }}>
            {initial ? "Edit Item" : "New Item"}
          </h2>
          <button onClick={onClose} aria-label="Close">
            <X size={20} style={{ color: "#8d9096" }} />
          </button>
        </div>

        <div className="px-5 py-4">
          <Field label="Name">
            <input className="w-full px-3 py-2 text-sm" style={inputStyle} value={form.name} onChange={set("name")} />
          </Field>
          <Field label="Part #">
            <input className="w-full px-3 py-2 text-sm font-mono" style={inputStyle} value={form.partNumber} onChange={set("partNumber")} />
          </Field>
          <Field label="Category">
            <select className="w-full px-3 py-2 text-sm" style={inputStyle} value={form.category} onChange={set("category")}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="On Hand">
              <input type="number" className="w-full px-3 py-2 text-sm font-mono" style={inputStyle} value={form.onHand} onChange={set("onHand")} />
            </Field>
            <Field label="Threshold">
              <input type="number" className="w-full px-3 py-2 text-sm font-mono" style={inputStyle} value={form.threshold} onChange={set("threshold")} />
            </Field>
          </div>
          <OrdersEditor orders={form.orders} onChange={(orders) => setForm((f) => ({ ...f, orders }))} />

          {showSupplierFields && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price per Unit ($)">
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 text-sm font-mono"
                    style={inputStyle}
                    value={form.pricePerUnit}
                    onChange={set("pricePerUnit")}
                  />
                </Field>
                <Field label="Supplier">
                  <input
                    className="w-full px-3 py-2 text-sm"
                    style={inputStyle}
                    value={form.supplier}
                    onChange={set("supplier")}
                  />
                </Field>
              </div>
              <Field label="Supplier Contact">
                <input
                  className="w-full px-3 py-2 text-sm"
                  style={inputStyle}
                  placeholder="Name / email / phone"
                  value={form.supplierContact}
                  onChange={set("supplierContact")}
                />
              </Field>
            </>
          )}

          <Field label="Notes">
            <textarea rows={2} className="w-full px-3 py-2 text-sm" style={inputStyle} value={form.notes} onChange={set("notes")} />
          </Field>
        </div>

        <div className="flex items-center justify-between px-5 py-4 sticky bottom-0" style={{ backgroundColor: "#1f2124", borderTop: "1px solid #35373b" }}>
          {initial ? (
            <button onClick={() => onDelete(initial.id)} className="flex items-center gap-1.5 text-sm px-3 py-2" style={{ color: "#c0503a", fontFamily: "Inter, sans-serif" }}>
              <Trash2 size={15} /> Delete
            </button>
          ) : <span />}
          <button
            onClick={() => onSave(form)}
            disabled={!form.name.trim()}
            className="text-sm px-5 py-2 tracking-wide uppercase disabled:opacity-40"
            style={{ backgroundColor: "#3d7ea6", color: "#0e1112", fontFamily: "Inter, sans-serif", fontWeight: 600 }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Table ---------- */

function InventoryTable({ items, onRowClick }) {
  return (
    <div style={{ border: "1px solid #35373b" }}>
      <table className="w-full text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #35373b", color: "#8d9096" }} className="text-[11px] uppercase tracking-[0.1em]">
            <th className="text-left px-4 py-3 font-medium">Name</th>
            <th className="text-right px-4 py-3 font-medium">On Hand</th>
            <th className="text-right px-4 py-3 font-medium">Threshold</th>
            <th className="text-right px-4 py-3 font-medium">On Order</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => {
            const low = it.onHand < it.threshold;
            return (
              <tr
                key={it.id}
                onClick={() => onRowClick(it)}
                className="cursor-pointer transition-colors"
                style={{ borderBottom: "1px solid #26282c" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#232529")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <td className="px-4 py-3" style={{ color: "#ece9e2" }}>
                  <div className="flex items-center gap-2">
                    {low && <AlertTriangle size={13} style={{ color: "#c0503a" }} />}
                    <span>{it.name}</span>
                  </div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: "#8d9096" }}>{it.partNumber}</div>
                </td>
                <td className="px-4 py-3 text-right font-mono" style={{ color: low ? "#c0503a" : "#ece9e2", fontWeight: low ? 600 : 400 }}>
                  {it.onHand}
                </td>
                <td className="px-4 py-3 text-right font-mono" style={{ color: "#8d9096" }}>{it.threshold}</td>
                <td className="px-4 py-3 text-right">
                  <OrderChips orders={it.orders} />
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-10 text-center text-sm" style={{ color: "#8d9096" }}>
                Nothing here yet. Add the first item to start tracking stock.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- App ---------- */

function InventoryApp() {
  useFonts();
  const [tab, setTab] = useState("machined");
  const [machined, setMachined] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [ready, setReady] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    (async () => {
      const [m, s] = await Promise.all([
        loadList("machined-items-v5", SEED_MACHINED),
        loadList("materials-items-v8", SEED_MATERIALS),
      ]);
      setMachined(m);
      setMaterials(s);
      setReady(true);
    })();
  }, []);

  useEffect(() => { if (ready) saveList("machined-items-v5", machined); }, [machined, ready]);
  useEffect(() => { if (ready) saveList("materials-items-v8", materials); }, [materials, ready]);

  const isMachined = tab === "machined";
  const list = isMachined ? machined : materials;
  const setList = isMachined ? setMachined : setMaterials;
  const categories = isMachined ? MACHINED_CATEGORIES : MATERIAL_CATEGORIES;

  useEffect(() => {
    setCategoryFilter(categories[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filtered = useMemo(() => {
    return list.filter((it) => categoryFilter === "All" || it.category === categoryFilter);
  }, [list, categoryFilter]);

  const attentionItems = useMemo(
    () => list.filter((it) => it.onHand < it.threshold),
    [list]
  );

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setModalOpen(true); };

  const handleSave = useCallback((form) => {
    if (editing) {
      setList((prev) => prev.map((it) => (it.id === editing.id ? { ...form, id: editing.id } : it)));
    } else {
      setList((prev) => [...prev, { ...form, id: uid() }]);
    }
    setModalOpen(false);
    setEditing(null);
  }, [editing, setList]);

  const handleDelete = useCallback((id) => {
    setList((prev) => prev.filter((it) => it.id !== id));
    setModalOpen(false);
    setEditing(null);
  }, [setList]);

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#17181a" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-baseline justify-between mb-1">
          <h1
            className="text-3xl sm:text-4xl tracking-wide"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "#ece9e2", fontWeight: 700, letterSpacing: "0.02em" }}
          >
            PRICE DESIGNS
          </h1>
          <span className="text-xs uppercase tracking-[0.2em]" style={{ color: "#8d9096", fontFamily: "Inter, sans-serif" }}>
            Shop Inventory
          </span>
        </div>
        <div className="h-px w-full mb-6" style={{ backgroundColor: "#35373b" }} />

        <div className="flex gap-1 mb-6">
          {[{ key: "machined", label: "Machined Components" }, { key: "materials", label: "Materials" }].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-4 py-2 text-sm tracking-wide uppercase transition-colors"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                color: tab === t.key ? "#0e1112" : "#8d9096",
                backgroundColor: tab === t.key ? "#3d7ea6" : "transparent",
                border: `1px solid ${tab === t.key ? "#3d7ea6" : "#35373b"}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AttentionPanel items={attentionItems} kind={tab} onJump={openEdit} />

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="SKUs Tracked" value={list.length} icon={Layers} />
          <StatCard
            label="Below Threshold"
            value={attentionItems.length}
            accent={attentionItems.length > 0 ? "#c0503a" : "#ece9e2"}
            icon={AlertTriangle}
          />
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex gap-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className="px-3 py-2 text-xs tracking-wide uppercase transition-colors"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  color: categoryFilter === c ? "#0e1112" : "#8d9096",
                  backgroundColor: categoryFilter === c ? "#3d7ea6" : "transparent",
                  border: `1px solid ${categoryFilter === c ? "#3d7ea6" : "#35373b"}`,
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            onClick={openNew}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm tracking-wide uppercase whitespace-nowrap ml-auto"
            style={{ backgroundColor: "#3d7ea6", color: "#0e1112", fontFamily: "Inter, sans-serif", fontWeight: 600 }}
          >
            <Plus size={15} /> Add Item
          </button>
        </div>

        {ready ? (
          <InventoryTable items={filtered} onRowClick={openEdit} />
        ) : (
          <div className="py-16 text-center text-sm" style={{ color: "#8d9096", fontFamily: "Inter, sans-serif" }}>
            Loading inventory…
          </div>
        )}
      </div>

      <ItemModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        onDelete={handleDelete}
        initial={editing}
        categories={categories}
        showSupplierFields={tab === "materials"}
      />
    </div>
  );
}
export default function App() {
  return (
    <PinGate appName="Shop Inventory" pin="1016" storageKey="inv_unlocked">
      <InventoryApp />
    </PinGate>
  );
}
