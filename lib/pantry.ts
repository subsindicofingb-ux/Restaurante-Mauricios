import type { Ingredient, Supplier, Unit } from "./types";

export const houseSuppliers: Supplier[] = [
  { id: "sup_peixe", name: "Peixaria", phone: "", category: "Frutos do mar" },
  { id: "sup_acougue", name: "Açougue", phone: "", category: "Carnes" },
  { id: "sup_horti", name: "Hortifruti", phone: "", category: "Hortifruti" },
  { id: "sup_mercearia", name: "Mercearia", phone: "", category: "Mercearia" },
  { id: "sup_laticinios", name: "Laticínios", phone: "", category: "Laticínios" },
  { id: "sup_bebidas", name: "Bebidas", phone: "", category: "Bebidas" },
  { id: "sup_doce", name: "Confeitaria", phone: "", category: "Confeitaria" },
];

function item(id: string, name: string, unit: Unit, category: string, supplierId: string): Ingredient {
  return { id, name, unit, category, stock: 0, minStock: 0, avgCost: 0, supplierId };
}

export const houseIngredients: Ingredient[] = [
  item("ing_camarao", "Camarão", "kg", "Frutos do mar", "sup_peixe"),
  item("ing_polvo", "Polvo", "kg", "Frutos do mar", "sup_peixe"),
  item("ing_lula", "Lula", "kg", "Frutos do mar", "sup_peixe"),
  item("ing_mexilhao", "Mexilhão", "kg", "Frutos do mar", "sup_peixe"),
  item("ing_bacalhau", "Bacalhau", "kg", "Frutos do mar", "sup_peixe"),
  item("ing_salmao", "Salmão", "kg", "Frutos do mar", "sup_peixe"),
  item("ing_badejo", "Badejo", "kg", "Frutos do mar", "sup_peixe"),
  item("ing_truta", "Truta", "kg", "Frutos do mar", "sup_peixe"),
  item("ing_lagosta", "Lagosta", "kg", "Frutos do mar", "sup_peixe"),
  item("ing_peixe", "Filé de peixe", "kg", "Frutos do mar", "sup_peixe"),
  item("ing_siri", "Siri", "kg", "Frutos do mar", "sup_peixe"),
  item("ing_alcaparra", "Alcaparras", "kg", "Frutos do mar", "sup_peixe"),

  item("ing_picanha", "Picanha", "kg", "Carnes", "sup_acougue"),
  item("ing_mignon", "Filé mignon", "kg", "Carnes", "sup_acougue"),
  item("ing_carne", "Carne para espeto", "kg", "Carnes", "sup_acougue"),
  item("ing_torresmo", "Torresmo", "kg", "Carnes", "sup_acougue"),
  item("ing_carne_moida", "Carne moída", "kg", "Carnes", "sup_acougue"),

  item("ing_queijo", "Queijo mussarela", "kg", "Laticínios", "sup_laticinios"),
  item("ing_coalho", "Queijo coalho", "kg", "Laticínios", "sup_laticinios"),
  item("ing_catupiry", "Catupiry", "kg", "Laticínios", "sup_laticinios"),
  item("ing_gorgonzola", "Gorgonzola", "kg", "Laticínios", "sup_laticinios"),
  item("ing_creme", "Creme de leite", "L", "Laticínios", "sup_laticinios"),
  item("ing_leite", "Leite", "L", "Laticínios", "sup_laticinios"),

  item("ing_batata", "Batata", "kg", "Hortifruti", "sup_horti"),
  item("ing_alho", "Alho", "kg", "Hortifruti", "sup_horti"),
  item("ing_cebola", "Cebola", "kg", "Hortifruti", "sup_horti"),
  item("ing_tomate", "Tomate", "kg", "Hortifruti", "sup_horti"),
  item("ing_alface", "Alface", "un", "Hortifruti", "sup_horti"),
  item("ing_brocolis", "Brócolis", "kg", "Hortifruti", "sup_horti"),
  item("ing_limao", "Limão", "kg", "Hortifruti", "sup_horti"),
  item("ing_maracuja", "Maracujá", "kg", "Hortifruti", "sup_horti"),
  item("ing_mamao", "Mamão", "kg", "Hortifruti", "sup_horti"),
  item("ing_banana", "Banana", "kg", "Hortifruti", "sup_horti"),

  item("ing_arroz", "Arroz", "kg", "Mercearia", "sup_mercearia"),
  item("ing_feijao", "Feijão", "kg", "Mercearia", "sup_mercearia"),
  item("ing_farofa", "Farinha de mandioca", "kg", "Mercearia", "sup_mercearia"),
  item("ing_oleo", "Óleo", "L", "Mercearia", "sup_mercearia"),
  item("ing_nhoque", "Nhoque", "kg", "Mercearia", "sup_mercearia"),
  item("ing_massa", "Massa (talharim ou espaguete)", "kg", "Mercearia", "sup_mercearia"),
  item("ing_tapioca", "Tapioca", "kg", "Mercearia", "sup_mercearia"),
  item("ing_ovo", "Ovo", "un", "Mercearia", "sup_mercearia"),
  item("ing_leitecond", "Leite condensado", "un", "Confeitaria", "sup_doce"),
  item("ing_chocolate", "Chocolate", "kg", "Confeitaria", "sup_doce"),
  item("ing_goiabada", "Goiabada", "kg", "Confeitaria", "sup_doce"),

  item("ing_chopp", "Chopp", "L", "Bebidas", "sup_bebidas"),
  item("ing_long", "Cerveja long neck", "un", "Bebidas", "sup_bebidas"),
  item("ing_heineken", "Cerveja Heineken", "un", "Bebidas", "sup_bebidas"),
  item("ing_refri", "Refrigerante lata", "un", "Bebidas", "sup_bebidas"),
  item("ing_agua", "Água mineral", "un", "Bebidas", "sup_bebidas"),
  item("ing_agua_gas", "Água com gás", "un", "Bebidas", "sup_bebidas"),
  item("ing_suco", "Suco", "L", "Bebidas", "sup_bebidas"),
  item("ing_cafe", "Café", "kg", "Bebidas", "sup_bebidas"),
  item("ing_cachaca", "Cachaça", "L", "Bebidas", "sup_bebidas"),
  item("ing_vodka", "Vodka", "L", "Bebidas", "sup_bebidas"),
  item("ing_saque", "Saquê", "L", "Bebidas", "sup_bebidas"),
  item("ing_whisky", "Whisky", "L", "Bebidas", "sup_bebidas"),
  item("ing_gim", "Gim", "L", "Bebidas", "sup_bebidas"),
  item("ing_licor", "Licor", "L", "Bebidas", "sup_bebidas"),
];
