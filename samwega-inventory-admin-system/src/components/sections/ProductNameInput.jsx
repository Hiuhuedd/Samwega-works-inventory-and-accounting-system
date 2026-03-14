// components/inventory/sections/ProductNameInput.jsx
import { useState, useEffect, useRef } from "react";
import { Package } from "lucide-react";
import { parseSupplierItem } from "@/lib/universalSupplierParser";

// Hardware, building materials, farming tools suggestions
export const PRODUCT_CATALOG = [
  // A
  { name: "Abra grinding", price: 165, category: "Tools" },
  { name: "AXE 2.0LB", price: 430, category: "Tools" },
  { name: "AXE 2.5LB", price: 385, category: "Tools" },
  { name: "Axe 4lb", price: 485, category: "Tools" },
  { name: "Axe head 3.5lb", price: 465, category: "Tools" },
  { name: "Axe head 3lb", price: 430, category: "Tools" },
 
  // B
  { name: "Barbed wire 240", price: 1600, category: "Wire & Mesh" },
  { name: "Barbed wire 480", price: 3200, category: "Wire & Mesh" },
  { name: "Barbed wire 610", price: 4000, category: "Wire & Mesh" },
  { name: "Bath tap", price: 1800, category: "Plumbing" },
  { name: "Binding wire", price: 2470, category: "Wire & Mesh" },
  { name: "Butterfly hinges", price: 50, category: "Hardware" },
 
  // C
  { name: "Ceiling nail", price: 3900, category: "Nails & Fasteners" },
  { name: "Chicken wire 1/2 x 6ft", price: 2100, category: "Wire & Mesh" },
  { name: "Chicken wire 3/4 6ft", price: 1500, category: "Wire & Mesh" },
  { name: "Chicken wire 3/4x3ft coated", price: 1450, category: "Wire & Mesh" },
  { name: "Chicken wire 1/2 3ft", price: 800, category: "Wire & Mesh" },
  { name: "Chicken wire 1/2x3 galvanised", price: 1950, category: "Wire & Mesh" },
  { name: "Chicken wire 3/4 (3 feet)", price: 850, category: "Wire & Mesh" },
  { name: "Chrome pipe 1", price: 240, category: "Plumbing" },
  { name: "Chrome pipe 3/4\"", price: 220, category: "Plumbing" },
  { name: "Clear horse pipe 1/2 x 60", price: 450, category: "Plumbing" },
  { name: "Coffee tray", price: 4100, category: "Other" },
  { name: "Concrete", price: 135, category: "Building Materials" },
 
  // D
  { name: "Door handle heavy", price: 50, category: "Hardware" },
  { name: "Door handle Y", price: 60, category: "Hardware" },
  { name: "Door handles light", price: 50, category: "Hardware" },
 
  // F
  { name: "Fork jembe 2.5lb", price: 345, category: "Garden Tools" },
  { name: "Fork jembe 3.5lb", price: 400, category: "Garden Tools" },
 
  // G
  { name: "Galvanised sheet", price: 4300, category: "Roofing" },
  { name: "Garden rake", price: 230, category: "Garden Tools" },
  { name: "Gate hinges", price: 250, category: "Hardware" },
  { name: "Gauze wire", price: 1200, category: "Wire & Mesh" },
 
  // H
  { name: "Hack saw blades", price: 83, category: "Tools" },
  { name: "Hacksaw frame", price: 190, category: "Tools" },
  { name: "Handsaw 14", price: 160, category: "Tools" },
  { name: "Handsaw 16", price: 170, category: "Tools" },
  { name: "Handsaw 18", price: 240, category: "Tools" },
  { name: "Handsaw 20", price: 195, category: "Tools" },
  { name: "Handsaw steel 16\"", price: 220, category: "Tools" },
  { name: "Hardbroom D2FH", price: 230, category: "Cleaning" },
  { name: "Hardbroom D4F", price: 0, category: "Cleaning" },
  { name: "Hero rod 3.2", price: 2950, category: "Building Materials" },
  { name: "Hero rods 2.5", price: 3250, category: "Building Materials" },
  { name: "Hoop iron", price: 2250, category: "Building Materials" },
 
  // I
  { name: "Iron sheet 2.5m 30g maisha", price: 12300, category: "Roofing" },
  { name: "Iron sheet 2.5m 32G maisha", price: 12400, category: "Roofing" },
  { name: "Iron sheet 2m x 32G maisha", price: 9920, category: "Roofing" },
  { name: "Iron sheet 2m 30g maisha", price: 9840, category: "Roofing" },
  { name: "Iron sheet 3m 30g maisha", price: 14760, category: "Roofing" },
  { name: "Iron sheet 3m 32g maisha", price: 14880, category: "Roofing" },
 
  // J
  { name: "Jembe 1.5LB", price: 235, category: "Garden Tools" },
  { name: "Jembe 2LB", price: 240, category: "Garden Tools" },
  { name: "Jembe 2.5LB", price: 345, category: "Garden Tools" },
  { name: "Jembe 3LB", price: 226, category: "Garden Tools" },
  { name: "Jk file 10", price: 1800, category: "Tools" },
  { name: "Jk file 8", price: 1416, category: "Tools" },
 
  // M
  { name: "Malha hinges", price: 75, category: "Hardware" },
  { name: "Mannila 18ply", price: 280, category: "Other" },
  { name: "Mannila 42ply", price: 380, category: "Other" },
  { name: "Mason hammer 2.5lb", price: 240, category: "Tools" },
  { name: "Mason hammer 2lb", price: 220, category: "Tools" },
  { name: "Mason hammer 3lb", price: 260, category: "Tools" },
  { name: "MDF screw", price: 0, category: "Nails & Fasteners" },
  { name: "Medium mopper + handle (L4FH)", price: 140, category: "Cleaning" },
  { name: "Medium mopper + handle (L5FH)", price: 0, category: "Cleaning" },
  { name: "Metalic hammer", price: 190, category: "Tools" },
  { name: "Mixer tap", price: 1200, category: "Plumbing" },
 
  // N
  { name: "Ngombe 480", price: 5750, category: "Wire & Mesh" },
  { name: "Ngombe 610", price: 7150, category: "Wire & Mesh" },
  { name: "Nylon gauze wire", price: 1180, category: "Wire & Mesh" },
 
  // O
  { name: "Oasis cutting", price: 95, category: "Tools" },
  { name: "Ordinary nail 50 kgs", price: 5600, category: "Nails & Fasteners" },
  { name: "Osho oxide", price: 3202, category: "Paints & Finishes" },
 
  // P
  { name: "Pad bolt", price: 80, category: "Hardware" },
  { name: "Paint brush 1", price: 240, category: "Paints & Finishes" },
  { name: "Paint brush 2", price: 360, category: "Paints & Finishes" },
  { name: "Paint brush 3\"", price: 600, category: "Paints & Finishes" },
  { name: "Paint brush 4\"", price: 216, category: "Paints & Finishes" },
  { name: "Paint brush 5", price: 900, category: "Paints & Finishes" },
  { name: "Paint brush 6", price: 960, category: "Paints & Finishes" },
  { name: "Panel pins", price: 3900, category: "Nails & Fasteners" },
  { name: "Panga wooden 18", price: 270, category: "Tools" },
  { name: "Panga big 16\"", price: 210, category: "Tools" },
  { name: "Panga bladder", price: 235, category: "Tools" },
  { name: "Panga bladder 18\"", price: 245, category: "Tools" },
  { name: "Panga short", price: 150, category: "Tools" },
  { name: "Panga sunda heavy", price: 230, category: "Tools" },
  { name: "Pick mattock 5lb", price: 348, category: "Garden Tools" },
  { name: "Pick mattock 7lb", price: 420, category: "Garden Tools" },
  { name: "Pillar tap", price: 450, category: "Plumbing" },
  { name: "Pipe wrench 10\"", price: 372, category: "Plumbing" },
  { name: "Pipe wrench 12\"", price: 465, category: "Plumbing" },
  { name: "Pipe wrench 14\"", price: 560, category: "Plumbing" },
  { name: "Pipe wrench 18\"", price: 790, category: "Plumbing" },
  { name: "Pipe wrench 24\"", price: 1160, category: "Plumbing" },
  { name: "Plain sheet 32G", price: 10350, category: "Roofing" },
  { name: "Plain sheets 30G", price: 14400, category: "Roofing" },
  { name: "Plastic chicken wire", price: 4600, category: "Wire & Mesh" },
  { name: "Plastic coffee tray", price: 4500, category: "Other" },
  { name: "Pliers diamond big", price: 230, category: "Tools" },
  { name: "Pliers knicker", price: 186, category: "Tools" },
  { name: "Pliers super rubber", price: 157, category: "Tools" },
  { name: "Plumbob", price: 780, category: "Tools" },
  { name: "Polished nail", price: 3800, category: "Nails & Fasteners" },
  { name: "Polythene 3 feet", price: 885, category: "Building Materials" },
  { name: "Polythene 4 feet", price: 1206, category: "Building Materials" },
  { name: "Pruning shears big", price: 450, category: "Garden Tools" },
  { name: "PVC wire mesh", price: 3600, category: "Wire & Mesh" },
 
  // R
  { name: "Razor wire", price: 980, category: "Wire & Mesh" },
  { name: "Red oxide", price: 4300, category: "Paints & Finishes" },
  { name: "Ridges 32G", price: 4000, category: "Roofing" },
  { name: "Ridges / valley 30G", price: 4500, category: "Roofing" },
  { name: "Robtec grinding", price: 120, category: "Tools" },
  { name: "Robtech cutting 9", price: 110, category: "Tools" },
  { name: "Roller brush", price: 95, category: "Paints & Finishes" },
  { name: "Roofing nails", price: 8000, category: "Nails & Fasteners" },
  { name: "Rope 10x200", price: 2600, category: "Other" },
  { name: "Rope 12x200mm", price: 3600, category: "Other" },
  { name: "Rope 6x200", price: 1000, category: "Other" },
  { name: "Rope 8x200", price: 1600, category: "Other" },
 
  // S
  { name: "Sali cutting", price: 85, category: "Tools" },
  { name: "Sand paper", price: 1280, category: "Paints & Finishes" },
  { name: "Scrubbing brush (A1)", price: 60, category: "Cleaning" },
  { name: "Silage bag 25kgs", price: 5750, category: "Agriculture" },
  { name: "Silage bag 40kgs", price: 7400, category: "Agriculture" },
  { name: "Silicone tube", price: 115, category: "Plumbing" },
  { name: "Slasher plastic", price: 125, category: "Garden Tools" },
  { name: "Slasher wooden", price: 136, category: "Garden Tools" },
  { name: "Sledge hammer 10lb", price: 700, category: "Tools" },
  { name: "Sledge hammer 12lb", price: 840, category: "Tools" },
  { name: "Sledge hammer 14lb", price: 980, category: "Tools" },
  { name: "Sledge hammer 8lb", price: 560, category: "Tools" },
  { name: "Sliding bolt", price: 90, category: "Hardware" },
  { name: "Soft broom + handle (C62FH)", price: 140, category: "Cleaning" },
  { name: "Soft broom C38", price: 0, category: "Cleaning" },
  { name: "Soft broom C61 FH", price: 140, category: "Cleaning" },
  { name: "Spade metallic", price: 320, category: "Garden Tools" },
  { name: "Spade wooden", price: 318, category: "Garden Tools" },
  { name: "Steel float knicker", price: 1920, category: "Tools" },
 
  // T
  { name: "T hinges 4\"", price: 60, category: "Hardware" },
  { name: "T hinges 6\"", price: 80, category: "Hardware" },
  { name: "Tap lirlee 1/2", price: 270, category: "Plumbing" },
  { name: "Tape 3m", price: 540, category: "Tools" },
  { name: "Tape 5m", price: 720, category: "Tools" },
  { name: "Tape 7.5m", price: 1320, category: "Tools" },
  { name: "Tape measure 5m HQ", price: 1800, category: "Tools" },
  { name: "Tarimbo big", price: 0, category: "Other" },
  { name: "Tarimbo medium", price: 0, category: "Other" },
  { name: "Tee pee twine 100 mtrs", price: 530, category: "Other" },
  { name: "Tiles corner metalic", price: 120, category: "Building Materials" },
  { name: "Tiles corner plastic", price: 45, category: "Building Materials" },
  { name: "Toto pad", price: 60, category: "Other" },
  { name: "Toto tower", price: 50, category: "Other" },
  { name: "Tower bolt", price: 70, category: "Hardware" },
  { name: "Trowel big", price: 60, category: "Tools" },
  { name: "Trowel medium", price: 50, category: "Tools" },
  { name: "Trowel small", price: 40, category: "Tools" },
  { name: "Try square", price: 0, category: "Tools" },
 
  // U
  { name: "U nail", price: 3900, category: "Nails & Fasteners" },
 
  // W
  { name: "Wheelbarrow wheels", price: 800, category: "Tools" },
  { name: "Window fastener", price: 50, category: "Hardware" },
  { name: "Window stay", price: 60, category: "Hardware" },
  { name: "Wire brush", price: 80, category: "Cleaning" },
  { name: "Wire brush proson", price: 60, category: "Cleaning" },
  { name: "Wire mesh coated", price: 4500, category: "Wire & Mesh" },
 
  // Y
  { name: "Yellow hammer", price: 220, category: "Tools" },
  { name: "Yellow polythene", price: 5200, category: "Building Materials" },
 
  // Z
  { name: "Zebra horse pipe 1/2 x 60", price: 400, category: "Plumbing" },
  { name: "Zebra hose 3/4x60ft", price: 630, category: "Plumbing" },
];

export default function ProductNameInput({ value, onChange, onSelect, onPackagingDetected }) {
  const [suggestions] = useState(PRODUCT_CATALOG);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Filter suggestions
  const filtered = value && value.length > 1
    ? suggestions
      .filter(item => item.name.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 8)
    : [];

  // Auto-detect packaging from name
  useEffect(() => {
    const parsed = parseSupplierItem(value);
    if (parsed?.packagingStructure?.layers >= 2) {
      const layers = [];
      const s = parsed.packagingStructure;

      if (s.layers === 3) {
        layers.push({ qty: s.outer.quantity, unit: s.outer.unit });
        layers.push({ qty: s.middle.quantity, unit: s.middle.unit });
        layers.push({ qty: s.inner.quantity, unit: s.inner.unit });
      } else if (s.layers === 2) {
        layers.push({ qty: s.outer.quantity, unit: s.outer.unit });
        layers.push({ qty: s.inner.quantity, unit: s.inner.unit });
      }

      onPackagingDetected(layers);
    }
  }, [value, onPackagingDetected]);

  const handleSelect = (item) => {
    onChange(item.name);
    onSelect(item);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="glass-panel p-6 relative">
      <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Package size={18} className="text-sky-600" />
        Product Name
      </label>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className="input-field text-sm py-3"
        placeholder="Type to search products..."
      />

      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto glass-panel shadow-lg left-0 right-0">
          {filtered.map((item, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(item)}
              className="w-full border-b px-4 py-3 text-left text-sm text-slate-800 last:border-b-0 hover:bg-slate-50"
            >
              <div className="font-bold text-gray-800">{item.name}</div>
              <div className="text-sm text-gray-600">KES {item.price.toLocaleString()} • {item.category}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}