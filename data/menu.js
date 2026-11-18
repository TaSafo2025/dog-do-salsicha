/* Dados do Dog do Salsicha — extraídos do cardápio atual (Cardápio Web) em 17/11/2026.
   Custos de insumos e fichas técnicas são ESTIMATIVAS para demonstração. */
window.DOG = {
 "store": {
  "name": "Dog do Salsicha",
  "fullName": "Dog do Salsicha - Delivery",
  "slogan": "O melhor dog da Cidade!",
  "whatsapp": "5561998826477",
  "phoneLabel": "(61) 99882-6477",
  "address": "QN 310 Conjunto 3/4, nº 10 — ao lado do Conselho Tutelar",
  "district": "Samambaia Sul",
  "city": "Brasília/DF",
  "lat": "-15.874426",
  "lng": "-48.0748491",
  "minOrder": 17.0,
  "prepMin": 30,
  "deliveryMin": 60,
  "hours": {
   "0": [
    "18:15",
    "23:30"
   ],
   "1": null,
   "2": [
    "18:30",
    "23:30"
   ],
   "3": [
    "18:30",
    "23:30"
   ],
   "4": [
    "18:30",
    "23:30"
   ],
   "5": [
    "18:30",
    "23:30"
   ],
   "6": [
    "18:15",
    "23:30"
   ]
  },
  "payments": [
   "Pix",
   "Dinheiro",
   "Cartão de crédito",
   "Cartão de débito"
  ],
  "modes": [
   "delivery",
   "pickup",
   "dinein"
  ],
  "loyalty": {
   "pointsPerReal": 5,
   "reward": "Entrega grátis"
  }
 },
 "cats": [
  {
   "id": "mais-pedidos",
   "name": "Mais pedidos",
   "items": [
    "dog-molho-simples",
    "dog-chapa-duplo",
    "dog-chapa-simples",
    "dog-frango-desfiado",
    "dog-molho-duplo",
    "dogao-frango-desfiado",
    "supremo",
    "x-tudo",
    "x-bacon",
    "x-salada"
   ]
  },
  {
   "id": "combos",
   "name": "Combos",
   "items": [
    "combo-scooby-snack",
    "combo-fred-daphne",
    "combo-turma-do-misterio",
    "combo-maquina-do-misterio"
   ]
  },
  {
   "id": "hot-dogs",
   "name": "Hot dogs",
   "items": [
    "dog-molho-simples",
    "dog-molho-duplo",
    "dog-chapa-simples",
    "dog-chapa-duplo",
    "dog-frango-desfiado",
    "dogao-frango-desfiado",
    "super-dogao-frango-desfiado",
    "batata-refrigerante-310-ml"
   ]
  },
  {
   "id": "hamburgueres",
   "name": "Hambúrgueres artesanais",
   "items": [
    "x-burger",
    "x-salada",
    "classico",
    "supremo",
    "supremo-duplo",
    "x-tudo",
    "super-x-tudo",
    "x-bacon"
   ]
  },
  {
   "id": "batatas",
   "name": "Batata frita",
   "items": [
    "batata-frita-p",
    "batata-frita-m",
    "batata-frita-com-cheddar-bacon-pequena",
    "batata-frita-com-cheddar-bacon-media"
   ]
  },
  {
   "id": "bebidas",
   "name": "Bebidas",
   "items": [
    "coca-cola-310ml",
    "mineiro-lata-350ml",
    "coca-zero-310ml",
    "refrigerante-600-ml",
    "agua-sem-gas",
    "agua-com-gas",
    "refrigerante-2-litros",
    "refrigerante-1-5l",
    "suco-natural-de-laranja-300ml",
    "suco-natural-de-laranja-500ml"
   ]
  },
  {
   "id": "sobremesas",
   "name": "Sobremesas e docinhos",
   "items": [
    "pudim-150g-doce-de-leite",
    "pudim-150g-tradicional",
    "pudim-150g-maracuja",
    "balinha-de-caramelo"
   ]
  }
 ],
 "products": {
  "dog-molho-simples": {
   "id": "dog-molho-simples",
   "name": "Dog Molho simples",
   "desc": "Pão de leite Ninho, 1 salsicha Perdigão, queijo muçarela, milho, maionese caseira tradicional, maionese caseira de alho e batata palha.",
   "price": 17.0,
   "img": "assets/img/produtos/dog-molho-simples.webp",
   "available": true,
   "best": true,
   "recipe": {
    "pao-ninho": 1,
    "mussarela": 30,
    "milho": 20,
    "maionese-trad": 25,
    "maionese-alho": 20,
    "batata-palha": 25,
    "emb-dog": 1,
    "salsicha": 1
   },
   "groups": [
    {
     "id": "adicionais",
     "name": "Turbine seu lanche",
     "type": "multi",
     "min": 0,
     "max": 6,
     "maxEach": 3,
     "options": [
      {
       "id": "salsicha",
       "name": "Salsicha Perdigão",
       "price": 4
      },
      {
       "id": "bacon",
       "name": "Bacon",
       "price": 3
      },
      {
       "id": "mussarela",
       "name": "Queijo muçarela",
       "price": 3
      },
      {
       "id": "cheddar",
       "name": "Queijo cheddar",
       "price": 3
      },
      {
       "id": "ovo",
       "name": "Ovo",
       "price": 3
      },
      {
       "id": "frango",
       "name": "Frango desfiado",
       "price": 6
      },
      {
       "id": "milho-batata",
       "name": "Milho e batata palha",
       "price": 3
      }
     ]
    },
    {
     "id": "retirar",
     "name": "Quer tirar algo?",
     "type": "multi",
     "min": 0,
     "max": 3,
     "maxEach": 1,
     "options": [
      {
       "id": "milho",
       "name": "Sem milho",
       "price": 0
      },
      {
       "id": "batata-palha",
       "name": "Sem batata palha",
       "price": 0
      },
      {
       "id": "maionese-de-alho",
       "name": "Sem maionese de alho",
       "price": 0
      }
     ]
    },
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 5.87,
   "imgSm": "assets/img/produtos/dog-molho-simples-sm.webp"
  },
  "dog-chapa-duplo": {
   "id": "dog-chapa-duplo",
   "name": "Dog Chapa duplo",
   "desc": "Pão de leite Ninho, 2 salsichas Perdigão, dobro de queijo muçarela, milho, bacon, maionese caseira tradicional, maionese caseira de alho e batata palha.",
   "price": 20.0,
   "img": "assets/img/produtos/dog-chapa-duplo.webp",
   "available": true,
   "best": true,
   "recipe": {
    "pao-ninho": 1,
    "mussarela": 60,
    "milho": 20,
    "maionese-trad": 25,
    "maionese-alho": 20,
    "batata-palha": 25,
    "emb-dog": 1,
    "salsicha": 2,
    "bacon": 20
   },
   "groups": [
    {
     "id": "adicionais",
     "name": "Turbine seu lanche",
     "type": "multi",
     "min": 0,
     "max": 6,
     "maxEach": 3,
     "options": [
      {
       "id": "salsicha",
       "name": "Salsicha Perdigão",
       "price": 4
      },
      {
       "id": "bacon",
       "name": "Bacon",
       "price": 3
      },
      {
       "id": "mussarela",
       "name": "Queijo muçarela",
       "price": 3
      },
      {
       "id": "cheddar",
       "name": "Queijo cheddar",
       "price": 3
      },
      {
       "id": "ovo",
       "name": "Ovo",
       "price": 3
      },
      {
       "id": "frango",
       "name": "Frango desfiado",
       "price": 6
      },
      {
       "id": "milho-batata",
       "name": "Milho e batata palha",
       "price": 3
      }
     ]
    },
    {
     "id": "retirar",
     "name": "Quer tirar algo?",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 1,
     "options": [
      {
       "id": "milho",
       "name": "Sem milho",
       "price": 0
      },
      {
       "id": "batata-palha",
       "name": "Sem batata palha",
       "price": 0
      },
      {
       "id": "maionese-de-alho",
       "name": "Sem maionese de alho",
       "price": 0
      },
      {
       "id": "bacon",
       "name": "Sem bacon",
       "price": 0
      }
     ]
    },
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 8.91,
   "imgSm": "assets/img/produtos/dog-chapa-duplo-sm.webp"
  },
  "dog-chapa-simples": {
   "id": "dog-chapa-simples",
   "name": "Dog Chapa simples",
   "desc": "Pão de leite Ninho, 1 salsicha Perdigão, queijo muçarela, milho, bacon, maionese caseira tradicional, pasta de alho e batata palha.",
   "price": 17.0,
   "img": "assets/img/produtos/dog-chapa-simples.webp",
   "available": true,
   "best": true,
   "recipe": {
    "pao-ninho": 1,
    "mussarela": 30,
    "milho": 20,
    "maionese-trad": 25,
    "maionese-alho": 20,
    "batata-palha": 25,
    "emb-dog": 1,
    "salsicha": 1,
    "bacon": 20
   },
   "groups": [
    {
     "id": "adicionais",
     "name": "Turbine seu lanche",
     "type": "multi",
     "min": 0,
     "max": 6,
     "maxEach": 3,
     "options": [
      {
       "id": "salsicha",
       "name": "Salsicha Perdigão",
       "price": 4
      },
      {
       "id": "bacon",
       "name": "Bacon",
       "price": 3
      },
      {
       "id": "mussarela",
       "name": "Queijo muçarela",
       "price": 3
      },
      {
       "id": "cheddar",
       "name": "Queijo cheddar",
       "price": 3
      },
      {
       "id": "ovo",
       "name": "Ovo",
       "price": 3
      },
      {
       "id": "frango",
       "name": "Frango desfiado",
       "price": 6
      },
      {
       "id": "milho-batata",
       "name": "Milho e batata palha",
       "price": 3
      }
     ]
    },
    {
     "id": "retirar",
     "name": "Quer tirar algo?",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 1,
     "options": [
      {
       "id": "milho",
       "name": "Sem milho",
       "price": 0
      },
      {
       "id": "batata-palha",
       "name": "Sem batata palha",
       "price": 0
      },
      {
       "id": "maionese-de-alho",
       "name": "Sem maionese de alho",
       "price": 0
      },
      {
       "id": "bacon",
       "name": "Sem bacon",
       "price": 0
      }
     ]
    },
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 6.87,
   "imgSm": "assets/img/produtos/dog-chapa-simples-sm.webp"
  },
  "dog-frango-desfiado": {
   "id": "dog-frango-desfiado",
   "name": "Dog Frango desfiado",
   "desc": "Pão de leite Ninho, frango desfiado, queijo muçarela, milho, bacon, maionese caseira tradicional, maionese caseira de alho e batata palha.",
   "price": 21.0,
   "img": "assets/img/produtos/dog-frango-desfiado.webp",
   "available": true,
   "best": true,
   "recipe": {
    "pao-ninho": 1,
    "mussarela": 30,
    "milho": 20,
    "maionese-trad": 25,
    "maionese-alho": 20,
    "batata-palha": 25,
    "emb-dog": 1,
    "frango": 80,
    "bacon": 20
   },
   "groups": [
    {
     "id": "adicionais",
     "name": "Turbine seu lanche",
     "type": "multi",
     "min": 0,
     "max": 6,
     "maxEach": 3,
     "options": [
      {
       "id": "salsicha",
       "name": "Salsicha Perdigão",
       "price": 4
      },
      {
       "id": "bacon",
       "name": "Bacon",
       "price": 3
      },
      {
       "id": "mussarela",
       "name": "Queijo muçarela",
       "price": 3
      },
      {
       "id": "cheddar",
       "name": "Queijo cheddar",
       "price": 3
      },
      {
       "id": "ovo",
       "name": "Ovo",
       "price": 3
      },
      {
       "id": "frango",
       "name": "Frango desfiado",
       "price": 6
      },
      {
       "id": "milho-batata",
       "name": "Milho e batata palha",
       "price": 3
      }
     ]
    },
    {
     "id": "retirar",
     "name": "Quer tirar algo?",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 1,
     "options": [
      {
       "id": "milho",
       "name": "Sem milho",
       "price": 0
      },
      {
       "id": "batata-palha",
       "name": "Sem batata palha",
       "price": 0
      },
      {
       "id": "maionese-de-alho",
       "name": "Sem maionese de alho",
       "price": 0
      },
      {
       "id": "bacon",
       "name": "Sem bacon",
       "price": 0
      }
     ]
    },
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 8.49,
   "imgSm": "assets/img/produtos/dog-frango-desfiado-sm.webp"
  },
  "dog-molho-duplo": {
   "id": "dog-molho-duplo",
   "name": "Dog Molho duplo",
   "desc": "Pão de leite Ninho, 2 salsichas Perdigão, dobro de queijo muçarela, milho, maionese caseira tradicional, maionese caseira de alho e batata palha.",
   "price": 20.0,
   "img": "assets/img/produtos/dog-molho-duplo.webp",
   "available": true,
   "best": true,
   "recipe": {
    "pao-ninho": 1,
    "mussarela": 60,
    "milho": 20,
    "maionese-trad": 25,
    "maionese-alho": 20,
    "batata-palha": 25,
    "emb-dog": 1,
    "salsicha": 2
   },
   "groups": [
    {
     "id": "adicionais",
     "name": "Turbine seu lanche",
     "type": "multi",
     "min": 0,
     "max": 6,
     "maxEach": 3,
     "options": [
      {
       "id": "salsicha",
       "name": "Salsicha Perdigão",
       "price": 4
      },
      {
       "id": "bacon",
       "name": "Bacon",
       "price": 3
      },
      {
       "id": "mussarela",
       "name": "Queijo muçarela",
       "price": 3
      },
      {
       "id": "cheddar",
       "name": "Queijo cheddar",
       "price": 3
      },
      {
       "id": "ovo",
       "name": "Ovo",
       "price": 3
      },
      {
       "id": "frango",
       "name": "Frango desfiado",
       "price": 6
      },
      {
       "id": "milho-batata",
       "name": "Milho e batata palha",
       "price": 3
      }
     ]
    },
    {
     "id": "retirar",
     "name": "Quer tirar algo?",
     "type": "multi",
     "min": 0,
     "max": 3,
     "maxEach": 1,
     "options": [
      {
       "id": "milho",
       "name": "Sem milho",
       "price": 0
      },
      {
       "id": "batata-palha",
       "name": "Sem batata palha",
       "price": 0
      },
      {
       "id": "maionese-de-alho",
       "name": "Sem maionese de alho",
       "price": 0
      }
     ]
    },
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 7.91,
   "imgSm": "assets/img/produtos/dog-molho-duplo-sm.webp"
  },
  "dogao-frango-desfiado": {
   "id": "dogao-frango-desfiado",
   "name": "Dogão Frango desfiado",
   "desc": "Pão de leite Ninho, frango desfiado, 1 Salsicha Perdigão, queijo muçarela, milho, bacon, maionese caseira tradicional, maionese caseira de alho e batata palha.",
   "price": 23.0,
   "img": "assets/img/produtos/dogao-frango-desfiado.webp",
   "available": true,
   "best": true,
   "recipe": {
    "pao-ninho": 1,
    "mussarela": 30,
    "milho": 20,
    "maionese-trad": 25,
    "maionese-alho": 20,
    "batata-palha": 25,
    "emb-dog": 1,
    "frango": 80,
    "salsicha": 1,
    "bacon": 20
   },
   "groups": [
    {
     "id": "adicionais",
     "name": "Turbine seu lanche",
     "type": "multi",
     "min": 0,
     "max": 6,
     "maxEach": 3,
     "options": [
      {
       "id": "salsicha",
       "name": "Salsicha Perdigão",
       "price": 4
      },
      {
       "id": "bacon",
       "name": "Bacon",
       "price": 3
      },
      {
       "id": "mussarela",
       "name": "Queijo muçarela",
       "price": 3
      },
      {
       "id": "cheddar",
       "name": "Queijo cheddar",
       "price": 3
      },
      {
       "id": "ovo",
       "name": "Ovo",
       "price": 3
      },
      {
       "id": "frango",
       "name": "Frango desfiado",
       "price": 6
      },
      {
       "id": "milho-batata",
       "name": "Milho e batata palha",
       "price": 3
      }
     ]
    },
    {
     "id": "retirar",
     "name": "Quer tirar algo?",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 1,
     "options": [
      {
       "id": "milho",
       "name": "Sem milho",
       "price": 0
      },
      {
       "id": "batata-palha",
       "name": "Sem batata palha",
       "price": 0
      },
      {
       "id": "maionese-de-alho",
       "name": "Sem maionese de alho",
       "price": 0
      },
      {
       "id": "bacon",
       "name": "Sem bacon",
       "price": 0
      }
     ]
    },
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 9.27,
   "imgSm": "assets/img/produtos/dogao-frango-desfiado-sm.webp"
  },
  "supremo": {
   "id": "supremo",
   "name": "Supremo",
   "desc": "Pão brioche, 1 Hambúrguer Smach 80gr, Ovo, + Queijo muçarela, Queijo cheddar + Bacon, Cebola roxa Maionese da casa, Maionese de alho.",
   "price": 27.0,
   "img": "assets/img/produtos/supremo.webp",
   "available": true,
   "best": true,
   "recipe": {
    "pao-brioche": 1,
    "smash-80": 1,
    "ovo": 1,
    "mussarela": 30,
    "cheddar": 20,
    "bacon": 25,
    "cebola-roxa": 15,
    "maionese-trad": 20,
    "maionese-alho": 15,
    "emb-burger": 1
   },
   "groups": [
    {
     "id": "adicionais",
     "name": "Turbine seu lanche",
     "type": "multi",
     "min": 0,
     "max": 6,
     "maxEach": 3,
     "options": [
      {
       "id": "hamburguer",
       "name": "Hambúrguer artesanal",
       "price": 8
      },
      {
       "id": "bacon",
       "name": "Bacon",
       "price": 3
      },
      {
       "id": "mussarela",
       "name": "Queijo muçarela",
       "price": 3
      },
      {
       "id": "cheddar",
       "name": "Queijo cheddar",
       "price": 3
      },
      {
       "id": "ovo",
       "name": "Ovo",
       "price": 3
      },
      {
       "id": "salada",
       "name": "Salada",
       "price": 2.5
      }
     ]
    },
    {
     "id": "retirar",
     "name": "Quer tirar algo?",
     "type": "multi",
     "min": 0,
     "max": 3,
     "maxEach": 1,
     "options": [
      {
       "id": "cebola-roxa",
       "name": "Sem cebola roxa",
       "price": 0
      },
      {
       "id": "ovo",
       "name": "Sem ovo",
       "price": 0
      },
      {
       "id": "bacon",
       "name": "Sem bacon",
       "price": 0
      }
     ]
    },
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 9.79,
   "imgSm": "assets/img/produtos/supremo-sm.webp"
  },
  "x-tudo": {
   "id": "x-tudo",
   "name": "X-Tudo",
   "desc": "Pão, 1 Hambúrguer artesanal bem passado, 1 salsicha Perdigão, cebola roxa, bacon em cubos, queijo muçarela, 1 ovo, milho, batata palha, alface, tomate e maionese de ervas, maionese de ervas.",
   "price": 29.0,
   "img": "assets/img/produtos/x-tudo.webp",
   "available": true,
   "best": true,
   "recipe": {
    "pao-burger": 1,
    "burger-artesanal": 1,
    "salsicha": 1,
    "cebola-roxa": 15,
    "bacon": 25,
    "mussarela": 30,
    "ovo": 1,
    "milho": 20,
    "batata-palha": 20,
    "alface": 15,
    "tomate": 30,
    "maionese-ervas": 25,
    "emb-burger": 1
   },
   "groups": [
    {
     "id": "adicionais",
     "name": "Turbine seu lanche",
     "type": "multi",
     "min": 0,
     "max": 6,
     "maxEach": 3,
     "options": [
      {
       "id": "hamburguer",
       "name": "Hambúrguer artesanal",
       "price": 8
      },
      {
       "id": "bacon",
       "name": "Bacon",
       "price": 3
      },
      {
       "id": "mussarela",
       "name": "Queijo muçarela",
       "price": 3
      },
      {
       "id": "cheddar",
       "name": "Queijo cheddar",
       "price": 3
      },
      {
       "id": "ovo",
       "name": "Ovo",
       "price": 3
      },
      {
       "id": "salada",
       "name": "Salada",
       "price": 2.5
      }
     ]
    },
    {
     "id": "retirar",
     "name": "Quer tirar algo?",
     "type": "multi",
     "min": 0,
     "max": 7,
     "maxEach": 1,
     "options": [
      {
       "id": "cebola-roxa",
       "name": "Sem cebola roxa",
       "price": 0
      },
      {
       "id": "alface",
       "name": "Sem alface",
       "price": 0
      },
      {
       "id": "tomate",
       "name": "Sem tomate",
       "price": 0
      },
      {
       "id": "ovo",
       "name": "Sem ovo",
       "price": 0
      },
      {
       "id": "bacon",
       "name": "Sem bacon",
       "price": 0
      },
      {
       "id": "milho",
       "name": "Sem milho",
       "price": 0
      },
      {
       "id": "batata-palha",
       "name": "Sem batata palha",
       "price": 0
      }
     ]
    },
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 11.34,
   "imgSm": "assets/img/produtos/x-tudo-sm.webp"
  },
  "x-bacon": {
   "id": "x-bacon",
   "name": "X-Bacon",
   "desc": "Pão, hambúrguer artesanal, queijo muçarela, bacon e maionese de ervas.",
   "price": 19.0,
   "img": "assets/img/produtos/x-bacon.webp",
   "available": true,
   "best": true,
   "recipe": {
    "pao-burger": 1,
    "burger-artesanal": 1,
    "mussarela": 30,
    "bacon": 30,
    "maionese-ervas": 20,
    "emb-burger": 1
   },
   "groups": [
    {
     "id": "adicionais",
     "name": "Turbine seu lanche",
     "type": "multi",
     "min": 0,
     "max": 6,
     "maxEach": 3,
     "options": [
      {
       "id": "hamburguer",
       "name": "Hambúrguer artesanal",
       "price": 8
      },
      {
       "id": "bacon",
       "name": "Bacon",
       "price": 3
      },
      {
       "id": "mussarela",
       "name": "Queijo muçarela",
       "price": 3
      },
      {
       "id": "cheddar",
       "name": "Queijo cheddar",
       "price": 3
      },
      {
       "id": "ovo",
       "name": "Ovo",
       "price": 3
      },
      {
       "id": "salada",
       "name": "Salada",
       "price": 2.5
      }
     ]
    },
    {
     "id": "retirar",
     "name": "Quer tirar algo?",
     "type": "multi",
     "min": 0,
     "max": 1,
     "maxEach": 1,
     "options": [
      {
       "id": "bacon",
       "name": "Sem bacon",
       "price": 0
      }
     ]
    },
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 7.86,
   "imgSm": "assets/img/produtos/x-bacon-sm.webp"
  },
  "x-salada": {
   "id": "x-salada",
   "name": "X-Salada",
   "desc": "Pão, Hambúrguer artesanal bem passado, queijo muçarela, alface, tomate e maionese de ervas.",
   "price": 16.0,
   "img": "assets/img/produtos/x-salada.webp",
   "available": true,
   "best": true,
   "recipe": {
    "pao-burger": 1,
    "burger-artesanal": 1,
    "mussarela": 30,
    "alface": 15,
    "tomate": 30,
    "maionese-ervas": 20,
    "emb-burger": 1
   },
   "groups": [
    {
     "id": "adicionais",
     "name": "Turbine seu lanche",
     "type": "multi",
     "min": 0,
     "max": 6,
     "maxEach": 3,
     "options": [
      {
       "id": "hamburguer",
       "name": "Hambúrguer artesanal",
       "price": 8
      },
      {
       "id": "bacon",
       "name": "Bacon",
       "price": 3
      },
      {
       "id": "mussarela",
       "name": "Queijo muçarela",
       "price": 3
      },
      {
       "id": "cheddar",
       "name": "Queijo cheddar",
       "price": 3
      },
      {
       "id": "ovo",
       "name": "Ovo",
       "price": 3
      },
      {
       "id": "salada",
       "name": "Salada",
       "price": 2.5
      }
     ]
    },
    {
     "id": "retirar",
     "name": "Quer tirar algo?",
     "type": "multi",
     "min": 0,
     "max": 2,
     "maxEach": 1,
     "options": [
      {
       "id": "alface",
       "name": "Sem alface",
       "price": 0
      },
      {
       "id": "tomate",
       "name": "Sem tomate",
       "price": 0
      }
     ]
    },
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 6.96,
   "imgSm": "assets/img/produtos/x-salada-sm.webp"
  },
  "combo-scooby-snack": {
   "id": "combo-scooby-snack",
   "name": "Combo Scooby Snack",
   "desc": "1 Dog Molho simples + bebida em lata gelada (Coca-Cola, Coca zero ou Mineiro). O combo perfeito pra matar a fome sozinho, sem economizar no sabor.",
   "price": 21.0,
   "img": "assets/img/produtos/combo-scooby-snack.webp",
   "available": true,
   "best": false,
   "recipe": {
    "pao-ninho": 1,
    "mussarela": 30,
    "milho": 20,
    "maionese-trad": 25,
    "maionese-alho": 20,
    "batata-palha": 25,
    "emb-dog": 1,
    "salsicha": 1,
    "coca-310": 1
   },
   "groups": [
    {
     "id": "bebida",
     "name": "Escolha a bebida",
     "type": "single",
     "min": 1,
     "max": 1,
     "options": [
      {
       "id": "coca-cola-310ml",
       "name": "Coca-Cola 310 ml",
       "price": 0,
       "product": "coca-cola-310ml"
      },
      {
       "id": "coca-zero-310ml",
       "name": "Coca Zero 310 ml",
       "price": 0,
       "product": "coca-zero-310ml"
      },
      {
       "id": "mineiro-lata-350ml",
       "name": "Guaraná Mineiro lata",
       "price": 0,
       "product": "mineiro-lata-350ml"
      }
     ]
    }
   ],
   "cost": 8.97,
   "combo": {
    "tag": "Individual",
    "includes": [
     {
      "product": "dog-molho-simples",
      "qty": 1
     }
    ],
    "fullPrice": 23
   },
   "imgSm": "assets/img/produtos/combo-scooby-snack-sm.webp"
  },
  "combo-fred-daphne": {
   "id": "combo-fred-daphne",
   "name": "Combo Fred & Daphne",
   "desc": "2x Dog Chapa duplo + Refrigerante 600ml. Pra dividir a dois sem dividir o sabor, o combo ideal pra um encontro gostoso.",
   "price": 47.0,
   "img": "assets/img/produtos/combo-fred-daphne.webp",
   "available": true,
   "best": false,
   "recipe": {
    "pao-ninho": 2,
    "mussarela": 120,
    "milho": 40,
    "maionese-trad": 50,
    "maionese-alho": 40,
    "batata-palha": 50,
    "emb-dog": 2,
    "salsicha": 4,
    "bacon": 40,
    "refri-600": 1
   },
   "groups": [],
   "cost": 22.62,
   "combo": {
    "tag": "Para o casal",
    "includes": [
     {
      "product": "dog-chapa-duplo",
      "qty": 2
     },
     {
      "product": "refrigerante-600-ml",
      "qty": 1
     }
    ],
    "fullPrice": 49
   },
   "imgSm": "assets/img/produtos/combo-fred-daphne-sm.webp"
  },
  "combo-turma-do-misterio": {
   "id": "combo-turma-do-misterio",
   "name": "Combo Turma do Mistério",
   "desc": "3x Dog Chapa simples + batata frita média + Refrigerante 600ml. Pra dividir com a turma, o combo perfeito pra matar a fome de todo mundo.",
   "price": 74.0,
   "img": "assets/img/produtos/combo-turma-do-misterio.webp",
   "available": true,
   "best": false,
   "recipe": {
    "pao-ninho": 3,
    "mussarela": 90,
    "milho": 60,
    "maionese-trad": 75,
    "maionese-alho": 60,
    "batata-palha": 75,
    "emb-dog": 3,
    "salsicha": 3,
    "bacon": 60,
    "batata-frita": 350,
    "emb-batata": 1,
    "refri-600": 1
   },
   "groups": [],
   "cost": 32.51,
   "combo": {
    "tag": "Para 3 pessoas",
    "includes": [
     {
      "product": "dog-chapa-simples",
      "qty": 3
     },
     {
      "product": "batata-frita-m",
      "qty": 1
     },
     {
      "product": "refrigerante-600-ml",
      "qty": 1
     }
    ],
    "fullPrice": 76
   },
   "imgSm": "assets/img/produtos/combo-turma-do-misterio-sm.webp"
  },
  "combo-maquina-do-misterio": {
   "id": "combo-maquina-do-misterio",
   "name": "Combo Máquina do Mistério",
   "desc": "4x Dog Molho duplo + batata cheddar & bacon média + Refrigerante 1, 5L. O combo completo pra reunir a família, com direito a batata especial e refri grande.",
   "price": 110.0,
   "img": "assets/img/produtos/combo-maquina-do-misterio.webp",
   "available": true,
   "best": false,
   "recipe": {
    "pao-ninho": 4,
    "mussarela": 240,
    "milho": 80,
    "maionese-trad": 100,
    "maionese-alho": 80,
    "batata-palha": 100,
    "emb-dog": 4,
    "salsicha": 8,
    "batata-frita": 350,
    "cheddar-cremoso": 60,
    "bacon": 30,
    "emb-batata": 1,
    "refri-1500": 1
   },
   "groups": [],
   "cost": 49.04,
   "combo": {
    "tag": "Para a família (4)",
    "includes": [
     {
      "product": "dog-molho-duplo",
      "qty": 4
     },
     {
      "product": "batata-frita-com-cheddar-bacon-media",
      "qty": 1
     },
     {
      "product": "refrigerante-1-5l",
      "qty": 1
     }
    ],
    "fullPrice": 112
   },
   "imgSm": "assets/img/produtos/combo-maquina-do-misterio-sm.webp"
  },
  "super-dogao-frango-desfiado": {
   "id": "super-dogao-frango-desfiado",
   "name": "Super Dogão Frango desfiado",
   "desc": "Pão de leite Ninho, frango desfiado, 1 ovo, 1 salsicha Perdigão, queijo muçarela, milho, bacon, maionese caseira tradicional, maionese caseira de alho e batata palha.",
   "price": 26.0,
   "img": "assets/img/produtos/super-dogao-frango-desfiado.webp",
   "available": true,
   "best": false,
   "recipe": {
    "pao-ninho": 1,
    "mussarela": 30,
    "milho": 20,
    "maionese-trad": 25,
    "maionese-alho": 20,
    "batata-palha": 25,
    "emb-dog": 1,
    "frango": 80,
    "salsicha": 1,
    "bacon": 20,
    "ovo": 1
   },
   "groups": [
    {
     "id": "adicionais",
     "name": "Turbine seu lanche",
     "type": "multi",
     "min": 0,
     "max": 6,
     "maxEach": 3,
     "options": [
      {
       "id": "salsicha",
       "name": "Salsicha Perdigão",
       "price": 4
      },
      {
       "id": "bacon",
       "name": "Bacon",
       "price": 3
      },
      {
       "id": "mussarela",
       "name": "Queijo muçarela",
       "price": 3
      },
      {
       "id": "cheddar",
       "name": "Queijo cheddar",
       "price": 3
      },
      {
       "id": "ovo",
       "name": "Ovo",
       "price": 3
      },
      {
       "id": "frango",
       "name": "Frango desfiado",
       "price": 6
      },
      {
       "id": "milho-batata",
       "name": "Milho e batata palha",
       "price": 3
      }
     ]
    },
    {
     "id": "retirar",
     "name": "Quer tirar algo?",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 1,
     "options": [
      {
       "id": "milho",
       "name": "Sem milho",
       "price": 0
      },
      {
       "id": "batata-palha",
       "name": "Sem batata palha",
       "price": 0
      },
      {
       "id": "maionese-de-alho",
       "name": "Sem maionese de alho",
       "price": 0
      },
      {
       "id": "bacon",
       "name": "Sem bacon",
       "price": 0
      }
     ]
    },
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 10.02,
   "imgSm": "assets/img/produtos/super-dogao-frango-desfiado-sm.webp"
  },
  "batata-refrigerante-310-ml": {
   "id": "batata-refrigerante-310-ml",
   "name": "Batata P + Refri 310 ml",
   "desc": "Batata frita P + Coca-Cola 310 ml.",
   "price": 15.0,
   "img": "assets/img/produtos/batata-refrigerante-310-ml.webp",
   "available": true,
   "best": false,
   "recipe": {
    "batata-frita": 200,
    "emb-batata": 1,
    "coca-310": 1
   },
   "groups": [],
   "cost": 7.35,
   "imgSm": "assets/img/produtos/batata-refrigerante-310-ml-sm.webp"
  },
  "x-burger": {
   "id": "x-burger",
   "name": "X-Burger",
   "desc": "pão, hamburger artesanal bem passado, queijo muçarela e maionese de ervas.",
   "price": 15.0,
   "img": "assets/img/produtos/x-burger.webp",
   "available": true,
   "best": false,
   "recipe": {
    "pao-burger": 1,
    "burger-artesanal": 1,
    "mussarela": 30,
    "maionese-ervas": 20,
    "emb-burger": 1
   },
   "groups": [
    {
     "id": "adicionais",
     "name": "Turbine seu lanche",
     "type": "multi",
     "min": 0,
     "max": 6,
     "maxEach": 3,
     "options": [
      {
       "id": "hamburguer",
       "name": "Hambúrguer artesanal",
       "price": 8
      },
      {
       "id": "bacon",
       "name": "Bacon",
       "price": 3
      },
      {
       "id": "mussarela",
       "name": "Queijo muçarela",
       "price": 3
      },
      {
       "id": "cheddar",
       "name": "Queijo cheddar",
       "price": 3
      },
      {
       "id": "ovo",
       "name": "Ovo",
       "price": 3
      },
      {
       "id": "salada",
       "name": "Salada",
       "price": 2.5
      }
     ]
    },
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 6.36,
   "imgSm": "assets/img/produtos/x-burger-sm.webp"
  },
  "classico": {
   "id": "classico",
   "name": "Clássico",
   "desc": "Pão brioche, 1 Hambúrguer Smach 80gr, Maionese da casa, Maionese de alho, queijo muçarela, Queijo cheddar, bacon e Cebola Roxa.",
   "price": 24.0,
   "img": "assets/img/produtos/classico.webp",
   "available": true,
   "best": false,
   "recipe": {
    "pao-brioche": 1,
    "smash-80": 1,
    "maionese-trad": 20,
    "maionese-alho": 15,
    "mussarela": 30,
    "cheddar": 20,
    "bacon": 25,
    "cebola-roxa": 15,
    "emb-burger": 1
   },
   "groups": [
    {
     "id": "adicionais",
     "name": "Turbine seu lanche",
     "type": "multi",
     "min": 0,
     "max": 6,
     "maxEach": 3,
     "options": [
      {
       "id": "hamburguer",
       "name": "Hambúrguer artesanal",
       "price": 8
      },
      {
       "id": "bacon",
       "name": "Bacon",
       "price": 3
      },
      {
       "id": "mussarela",
       "name": "Queijo muçarela",
       "price": 3
      },
      {
       "id": "cheddar",
       "name": "Queijo cheddar",
       "price": 3
      },
      {
       "id": "ovo",
       "name": "Ovo",
       "price": 3
      },
      {
       "id": "salada",
       "name": "Salada",
       "price": 2.5
      }
     ]
    },
    {
     "id": "retirar",
     "name": "Quer tirar algo?",
     "type": "multi",
     "min": 0,
     "max": 2,
     "maxEach": 1,
     "options": [
      {
       "id": "cebola-roxa",
       "name": "Sem cebola roxa",
       "price": 0
      },
      {
       "id": "bacon",
       "name": "Sem bacon",
       "price": 0
      }
     ]
    },
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 9.04,
   "imgSm": "assets/img/produtos/classico-sm.webp"
  },
  "supremo-duplo": {
   "id": "supremo-duplo",
   "name": "Supremo Duplo",
   "desc": "Pão brioche, 2 Hambúrgueres Smach 100gr cada. Ovo, Cebola roxa, Maionese de ervas, Maionese de alho, +Queijo cheddar, +Queijo Mussarela e + Bacon.",
   "price": 36.0,
   "img": "assets/img/produtos/supremo-duplo.webp",
   "available": true,
   "best": false,
   "recipe": {
    "pao-brioche": 1,
    "smash-100": 2,
    "ovo": 1,
    "cebola-roxa": 15,
    "maionese-ervas": 20,
    "maionese-alho": 15,
    "cheddar": 30,
    "mussarela": 40,
    "bacon": 35,
    "emb-burger": 1
   },
   "groups": [
    {
     "id": "adicionais",
     "name": "Turbine seu lanche",
     "type": "multi",
     "min": 0,
     "max": 6,
     "maxEach": 3,
     "options": [
      {
       "id": "hamburguer",
       "name": "Hambúrguer artesanal",
       "price": 8
      },
      {
       "id": "bacon",
       "name": "Bacon",
       "price": 3
      },
      {
       "id": "mussarela",
       "name": "Queijo muçarela",
       "price": 3
      },
      {
       "id": "cheddar",
       "name": "Queijo cheddar",
       "price": 3
      },
      {
       "id": "ovo",
       "name": "Ovo",
       "price": 3
      },
      {
       "id": "salada",
       "name": "Salada",
       "price": 2.5
      }
     ]
    },
    {
     "id": "retirar",
     "name": "Quer tirar algo?",
     "type": "multi",
     "min": 0,
     "max": 3,
     "maxEach": 1,
     "options": [
      {
       "id": "cebola-roxa",
       "name": "Sem cebola roxa",
       "price": 0
      },
      {
       "id": "ovo",
       "name": "Sem ovo",
       "price": 0
      },
      {
       "id": "bacon",
       "name": "Sem bacon",
       "price": 0
      }
     ]
    },
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 14.91,
   "imgSm": "assets/img/produtos/supremo-duplo-sm.webp"
  },
  "super-x-tudo": {
   "id": "super-x-tudo",
   "name": "Super X-Tudo",
   "desc": "Pão, 2 Hambúrgueres artesanais bem passados, 1 salsicha Perdigão, cebola roxa, dobro de bacon em cubos, dobro de queijo muçarela, 2 ovos, milho, batata palha, alface, tomate e maionese de ervas.",
   "price": 39.0,
   "img": "assets/img/produtos/super-x-tudo.webp",
   "available": true,
   "best": false,
   "recipe": {
    "pao-burger": 1,
    "burger-artesanal": 2,
    "salsicha": 1,
    "cebola-roxa": 15,
    "bacon": 50,
    "mussarela": 60,
    "ovo": 2,
    "milho": 20,
    "batata-palha": 20,
    "alface": 15,
    "tomate": 30,
    "maionese-ervas": 25,
    "emb-burger": 1
   },
   "groups": [
    {
     "id": "adicionais",
     "name": "Turbine seu lanche",
     "type": "multi",
     "min": 0,
     "max": 6,
     "maxEach": 3,
     "options": [
      {
       "id": "hamburguer",
       "name": "Hambúrguer artesanal",
       "price": 8
      },
      {
       "id": "bacon",
       "name": "Bacon",
       "price": 3
      },
      {
       "id": "mussarela",
       "name": "Queijo muçarela",
       "price": 3
      },
      {
       "id": "cheddar",
       "name": "Queijo cheddar",
       "price": 3
      },
      {
       "id": "ovo",
       "name": "Ovo",
       "price": 3
      },
      {
       "id": "salada",
       "name": "Salada",
       "price": 2.5
      }
     ]
    },
    {
     "id": "retirar",
     "name": "Quer tirar algo?",
     "type": "multi",
     "min": 0,
     "max": 7,
     "maxEach": 1,
     "options": [
      {
       "id": "cebola-roxa",
       "name": "Sem cebola roxa",
       "price": 0
      },
      {
       "id": "alface",
       "name": "Sem alface",
       "price": 0
      },
      {
       "id": "tomate",
       "name": "Sem tomate",
       "price": 0
      },
      {
       "id": "ovo",
       "name": "Sem ovo",
       "price": 0
      },
      {
       "id": "bacon",
       "name": "Sem bacon",
       "price": 0
      },
      {
       "id": "milho",
       "name": "Sem milho",
       "price": 0
      },
      {
       "id": "batata-palha",
       "name": "Sem batata palha",
       "price": 0
      }
     ]
    },
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 17.7,
   "imgSm": "assets/img/produtos/super-x-tudo-sm.webp"
  },
  "coca-cola-310ml": {
   "id": "coca-cola-310ml",
   "name": "Coca-Cola 310 ml",
   "desc": "Lata 310 ml gelada.",
   "price": 6.0,
   "img": "assets/img/produtos/coca-cola-310ml.webp",
   "available": true,
   "best": false,
   "recipe": {
    "coca-310": 1
   },
   "groups": [],
   "cost": 3.1,
   "imgSm": "assets/img/produtos/coca-cola-310ml-sm.webp"
  },
  "mineiro-lata-350ml": {
   "id": "mineiro-lata-350ml",
   "name": "Guaraná Mineiro lata 350 ml",
   "desc": "O guaraná de Brasília, lata 350 ml.",
   "price": 6.0,
   "img": "assets/img/produtos/mineiro-lata-350ml.webp",
   "available": false,
   "best": false,
   "recipe": {
    "mineiro-350": 1
   },
   "groups": [],
   "cost": 2.6,
   "imgSm": "assets/img/produtos/mineiro-lata-350ml-sm.webp"
  },
  "coca-zero-310ml": {
   "id": "coca-zero-310ml",
   "name": "Coca Zero 310 ml",
   "desc": "Lata 310 ml, sem açúcar.",
   "price": 6.0,
   "img": "assets/img/produtos/coca-zero-310ml.webp",
   "available": false,
   "best": false,
   "recipe": {
    "coca-zero-310": 1
   },
   "groups": [],
   "cost": 3.1,
   "imgSm": "assets/img/produtos/coca-zero-310ml-sm.webp"
  },
  "refrigerante-600-ml": {
   "id": "refrigerante-600-ml",
   "name": "Refrigerante 600 ml",
   "desc": "Garrafa 600 ml gelada.",
   "price": 9.0,
   "img": "assets/img/produtos/refrigerante-600-ml.webp",
   "available": true,
   "best": false,
   "recipe": {
    "refri-600": 1
   },
   "groups": [],
   "cost": 4.8,
   "imgSm": "assets/img/produtos/refrigerante-600-ml-sm.webp"
  },
  "agua-sem-gas": {
   "id": "agua-sem-gas",
   "name": "Água sem gás",
   "desc": "Garrafa 500 ml, bem gelada.",
   "price": 3.0,
   "img": "assets/img/produtos/agua-sem-gas.webp",
   "available": true,
   "best": false,
   "recipe": {
    "agua": 1
   },
   "groups": [],
   "cost": 1.1,
   "imgSm": "assets/img/produtos/agua-sem-gas-sm.webp"
  },
  "agua-com-gas": {
   "id": "agua-com-gas",
   "name": "Água com gás",
   "desc": "Garrafa 500 ml, bem gelada.",
   "price": 4.0,
   "img": "assets/img/produtos/agua-com-gas.webp",
   "available": true,
   "best": false,
   "recipe": {
    "agua-gas": 1
   },
   "groups": [],
   "cost": 1.5,
   "imgSm": "assets/img/produtos/agua-com-gas-sm.webp"
  },
  "refrigerante-2-litros": {
   "id": "refrigerante-2-litros",
   "name": "Refrigerante 2 L",
   "desc": "Garrafa 2 L para a família. Consulte os sabores no WhatsApp.",
   "price": 12.0,
   "img": "assets/img/produtos/refrigerante-2-litros.webp",
   "available": true,
   "best": false,
   "recipe": {
    "refri-2000": 1
   },
   "groups": [],
   "cost": 7.4,
   "imgSm": "assets/img/produtos/refrigerante-2-litros-sm.webp"
  },
  "refrigerante-1-5l": {
   "id": "refrigerante-1-5l",
   "name": "Refrigerante 1,5 L",
   "desc": "Garrafa 1,5 L para dividir. Consulte os sabores no WhatsApp.",
   "price": 11.0,
   "img": "assets/img/produtos/refrigerante-1-5l.webp",
   "available": true,
   "best": false,
   "recipe": {
    "refri-1500": 1
   },
   "groups": [],
   "cost": 6.4,
   "imgSm": "assets/img/produtos/refrigerante-1-5l-sm.webp"
  },
  "suco-natural-de-laranja-300ml": {
   "id": "suco-natural-de-laranja-300ml",
   "name": "Suco natural de laranja 300 ml",
   "desc": "Suco 100% natural, feito na hora. 300 ml.",
   "price": 8.0,
   "img": "assets/img/produtos/suco-natural-de-laranja-300ml.webp",
   "available": false,
   "best": false,
   "recipe": {
    "suco-300": 1
   },
   "groups": [],
   "cost": 2.3,
   "imgSm": "assets/img/produtos/suco-natural-de-laranja-300ml-sm.webp"
  },
  "suco-natural-de-laranja-500ml": {
   "id": "suco-natural-de-laranja-500ml",
   "name": "Suco natural de laranja 500 ml",
   "desc": "Suco 100% natural, feito na hora. 500 ml.",
   "price": 10.0,
   "img": "assets/img/produtos/suco-natural-de-laranja-500ml.webp",
   "available": true,
   "best": false,
   "recipe": {
    "suco-500": 1
   },
   "groups": [],
   "cost": 3.6,
   "imgSm": "assets/img/produtos/suco-natural-de-laranja-500ml-sm.webp"
  },
  "batata-frita-p": {
   "id": "batata-frita-p",
   "name": "Batata frita P",
   "desc": "Porção pequena de batata frita crocante.",
   "price": 11.0,
   "img": "assets/img/produtos/batata-frita-p.webp",
   "available": true,
   "best": false,
   "recipe": {
    "batata-frita": 200,
    "emb-batata": 1
   },
   "groups": [
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 4.25,
   "imgSm": "assets/img/produtos/batata-frita-p-sm.webp"
  },
  "batata-frita-m": {
   "id": "batata-frita-m",
   "name": "Batata frita M",
   "desc": "Porção média de batata frita crocante, boa para dividir.",
   "price": 16.0,
   "img": "assets/img/produtos/batata-frita-m.webp",
   "available": true,
   "best": false,
   "recipe": {
    "batata-frita": 350,
    "emb-batata": 1
   },
   "groups": [
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 7.1,
   "imgSm": "assets/img/produtos/batata-frita-m-sm.webp"
  },
  "batata-frita-com-cheddar-bacon-pequena": {
   "id": "batata-frita-com-cheddar-bacon-pequena",
   "name": "Batata cheddar & bacon P",
   "desc": "Batata frita coberta com cheddar cremoso e bacon. Porção pequena.",
   "price": 16.0,
   "img": "assets/img/produtos/batata-frita-com-cheddar-bacon-pequena.webp",
   "available": true,
   "best": false,
   "recipe": {
    "batata-frita": 200,
    "cheddar-cremoso": 40,
    "bacon": 20,
    "emb-batata": 1
   },
   "groups": [
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 6.85,
   "imgSm": "assets/img/produtos/batata-frita-com-cheddar-bacon-pequena-sm.webp"
  },
  "batata-frita-com-cheddar-bacon-media": {
   "id": "batata-frita-com-cheddar-bacon-media",
   "name": "Batata cheddar & bacon M",
   "desc": "Batata frita coberta com cheddar cremoso e bacon. Porção média.",
   "price": 21.0,
   "img": "assets/img/produtos/batata-frita-com-cheddar-bacon-media.webp",
   "available": true,
   "best": false,
   "recipe": {
    "batata-frita": 350,
    "cheddar-cremoso": 60,
    "bacon": 30,
    "emb-batata": 1
   },
   "groups": [
    {
     "id": "molhos",
     "name": "Molho extra à parte",
     "type": "multi",
     "min": 0,
     "max": 4,
     "maxEach": 2,
     "options": [
      {
       "id": "maionese-alho",
       "name": "Maionese de alho (copinho)",
       "price": 2.5
      },
      {
       "id": "maionese-ervas",
       "name": "Maionese de ervas (copinho)",
       "price": 2.5
      }
     ]
    }
   ],
   "cost": 11.0,
   "imgSm": "assets/img/produtos/batata-frita-com-cheddar-bacon-media-sm.webp"
  },
  "balinha-de-caramelo": {
   "id": "balinha-de-caramelo",
   "name": "Balinha de caramelo",
   "desc": "Aquele docinho para fechar o pedido.",
   "price": 0.3,
   "img": "assets/img/produtos/balinha-de-caramelo.webp",
   "available": true,
   "best": false,
   "recipe": {
    "bala": 1
   },
   "groups": [],
   "cost": 0.08,
   "imgSm": "assets/img/produtos/balinha-de-caramelo-sm.webp"
  },
  "pudim-150g-doce-de-leite": {
   "id": "pudim-150g-doce-de-leite",
   "name": "Pudim doce de leite 150 g",
   "desc": "Doce de leite.",
   "price": 18.9,
   "img": "assets/img/produtos/pudim-150g-doce-de-leite.webp",
   "available": false,
   "best": false,
   "recipe": {
    "pudim": 1
   },
   "groups": [],
   "cost": 6.2,
   "imgSm": "assets/img/produtos/pudim-150g-doce-de-leite-sm.webp"
  },
  "pudim-150g-tradicional": {
   "id": "pudim-150g-tradicional",
   "name": "Pudim tradicional 150 g",
   "desc": "Tradicional",
   "price": 18.9,
   "img": "assets/img/produtos/pudim-150g-tradicional.webp",
   "available": false,
   "best": false,
   "recipe": {
    "pudim": 1
   },
   "groups": [],
   "cost": 6.2,
   "imgSm": "assets/img/produtos/pudim-150g-tradicional-sm.webp"
  },
  "pudim-150g-maracuja": {
   "id": "pudim-150g-maracuja",
   "name": "Pudim de maracujá 150 g",
   "desc": "maracuja",
   "price": 18.9,
   "img": "assets/img/produtos/pudim-150g-maracuja.webp",
   "available": false,
   "best": false,
   "recipe": {
    "pudim": 1
   },
   "groups": [],
   "cost": 6.2,
   "imgSm": "assets/img/produtos/pudim-150g-maracuja-sm.webp"
  }
 },
 "insumos": [
  {
   "id": "pao-ninho",
   "name": "Pão de leite Ninho",
   "unit": "un",
   "cost": 0.9,
   "stock": 64,
   "min": 40,
   "buyUnit": "pacote 10 un"
  },
  {
   "id": "pao-brioche",
   "name": "Pão brioche",
   "unit": "un",
   "cost": 1.6,
   "stock": 22,
   "min": 15,
   "buyUnit": "pacote 6 un"
  },
  {
   "id": "pao-burger",
   "name": "Pão de hambúrguer",
   "unit": "un",
   "cost": 0.85,
   "stock": 30,
   "min": 20,
   "buyUnit": "pacote 8 un"
  },
  {
   "id": "salsicha",
   "name": "Salsicha Perdigão",
   "unit": "un",
   "cost": 0.78,
   "stock": 95,
   "min": 60,
   "buyUnit": "pacote 3 kg (~60 un)"
  },
  {
   "id": "mussarela",
   "name": "Queijo muçarela",
   "unit": "g",
   "cost": 0.042,
   "stock": 2600,
   "min": 2000,
   "buyUnit": "kg"
  },
  {
   "id": "cheddar",
   "name": "Queijo cheddar",
   "unit": "g",
   "cost": 0.052,
   "stock": 600,
   "min": 500,
   "buyUnit": "kg"
  },
  {
   "id": "milho",
   "name": "Milho verde",
   "unit": "g",
   "cost": 0.02,
   "stock": 1700,
   "min": 1000,
   "buyUnit": "lata 1,7 kg"
  },
  {
   "id": "batata-palha",
   "name": "Batata palha",
   "unit": "g",
   "cost": 0.048,
   "stock": 900,
   "min": 1500,
   "buyUnit": "pacote 1 kg"
  },
  {
   "id": "maionese-trad",
   "name": "Maionese caseira tradicional",
   "unit": "g",
   "cost": 0.016,
   "stock": 1800,
   "min": 1000,
   "buyUnit": "produção própria"
  },
  {
   "id": "maionese-alho",
   "name": "Maionese / pasta de alho",
   "unit": "g",
   "cost": 0.019,
   "stock": 1200,
   "min": 800,
   "buyUnit": "produção própria"
  },
  {
   "id": "maionese-ervas",
   "name": "Maionese de ervas",
   "unit": "g",
   "cost": 0.02,
   "stock": 900,
   "min": 800,
   "buyUnit": "produção própria"
  },
  {
   "id": "bacon",
   "name": "Bacon em cubos",
   "unit": "g",
   "cost": 0.05,
   "stock": 1500,
   "min": 1000,
   "buyUnit": "kg"
  },
  {
   "id": "frango",
   "name": "Frango desfiado",
   "unit": "g",
   "cost": 0.03,
   "stock": 1800,
   "min": 1200,
   "buyUnit": "produção própria"
  },
  {
   "id": "ovo",
   "name": "Ovo",
   "unit": "un",
   "cost": 0.75,
   "stock": 48,
   "min": 30,
   "buyUnit": "bandeja 30 un"
  },
  {
   "id": "burger-artesanal",
   "name": "Hambúrguer artesanal",
   "unit": "un",
   "cost": 3.1,
   "stock": 26,
   "min": 20,
   "buyUnit": "caixa 36 un"
  },
  {
   "id": "smash-80",
   "name": "Blend Smash 80 g",
   "unit": "un",
   "cost": 2.4,
   "stock": 30,
   "min": 20,
   "buyUnit": "caixa 50 un"
  },
  {
   "id": "smash-100",
   "name": "Blend Smash 100 g",
   "unit": "un",
   "cost": 3.0,
   "stock": 18,
   "min": 16,
   "buyUnit": "caixa 40 un"
  },
  {
   "id": "cebola-roxa",
   "name": "Cebola roxa",
   "unit": "g",
   "cost": 0.009,
   "stock": 2500,
   "min": 1000,
   "buyUnit": "kg"
  },
  {
   "id": "alface",
   "name": "Alface",
   "unit": "g",
   "cost": 0.02,
   "stock": 400,
   "min": 300,
   "buyUnit": "pé"
  },
  {
   "id": "tomate",
   "name": "Tomate",
   "unit": "g",
   "cost": 0.01,
   "stock": 1800,
   "min": 1000,
   "buyUnit": "kg"
  },
  {
   "id": "batata-frita",
   "name": "Batata frita congelada",
   "unit": "g",
   "cost": 0.019,
   "stock": 6500,
   "min": 5000,
   "buyUnit": "pacote 2,5 kg"
  },
  {
   "id": "cheddar-cremoso",
   "name": "Cheddar cremoso",
   "unit": "g",
   "cost": 0.04,
   "stock": 1100,
   "min": 800,
   "buyUnit": "bisnaga 1,5 kg"
  },
  {
   "id": "emb-dog",
   "name": "Embalagem de hot dog",
   "unit": "un",
   "cost": 0.55,
   "stock": 180,
   "min": 150,
   "buyUnit": "pacote 100 un"
  },
  {
   "id": "emb-burger",
   "name": "Caixa de hambúrguer",
   "unit": "un",
   "cost": 0.75,
   "stock": 90,
   "min": 80,
   "buyUnit": "pacote 50 un"
  },
  {
   "id": "emb-batata",
   "name": "Embalagem de batata",
   "unit": "un",
   "cost": 0.45,
   "stock": 120,
   "min": 80,
   "buyUnit": "pacote 100 un"
  },
  {
   "id": "sacola",
   "name": "Sacola de delivery",
   "unit": "un",
   "cost": 0.28,
   "stock": 300,
   "min": 200,
   "buyUnit": "pacote 500 un"
  },
  {
   "id": "coca-310",
   "name": "Coca-Cola 310 ml",
   "unit": "un",
   "cost": 3.1,
   "stock": 36,
   "min": 24,
   "buyUnit": "fardo 12 un"
  },
  {
   "id": "coca-zero-310",
   "name": "Coca Zero 310 ml",
   "unit": "un",
   "cost": 3.1,
   "stock": 0,
   "min": 12,
   "buyUnit": "fardo 12 un"
  },
  {
   "id": "mineiro-350",
   "name": "Guaraná Mineiro lata",
   "unit": "un",
   "cost": 2.6,
   "stock": 0,
   "min": 12,
   "buyUnit": "fardo 12 un"
  },
  {
   "id": "refri-600",
   "name": "Refrigerante 600 ml",
   "unit": "un",
   "cost": 4.8,
   "stock": 20,
   "min": 12,
   "buyUnit": "fardo 12 un"
  },
  {
   "id": "refri-1500",
   "name": "Refrigerante 1,5 L",
   "unit": "un",
   "cost": 6.4,
   "stock": 10,
   "min": 6,
   "buyUnit": "fardo 6 un"
  },
  {
   "id": "refri-2000",
   "name": "Refrigerante 2 L",
   "unit": "un",
   "cost": 7.4,
   "stock": 9,
   "min": 6,
   "buyUnit": "fardo 6 un"
  },
  {
   "id": "agua",
   "name": "Água sem gás 500 ml",
   "unit": "un",
   "cost": 1.1,
   "stock": 24,
   "min": 12,
   "buyUnit": "fardo 12 un"
  },
  {
   "id": "agua-gas",
   "name": "Água com gás 500 ml",
   "unit": "un",
   "cost": 1.5,
   "stock": 12,
   "min": 12,
   "buyUnit": "fardo 12 un"
  },
  {
   "id": "suco-500",
   "name": "Suco de laranja 500 ml",
   "unit": "un",
   "cost": 3.6,
   "stock": 8,
   "min": 6,
   "buyUnit": "produção própria"
  },
  {
   "id": "suco-300",
   "name": "Suco de laranja 300 ml",
   "unit": "un",
   "cost": 2.3,
   "stock": 0,
   "min": 6,
   "buyUnit": "produção própria"
  },
  {
   "id": "pudim",
   "name": "Pudim 150 g",
   "unit": "un",
   "cost": 6.2,
   "stock": 0,
   "min": 6,
   "buyUnit": "produção própria"
  },
  {
   "id": "bala",
   "name": "Balinha de caramelo",
   "unit": "un",
   "cost": 0.08,
   "stock": 300,
   "min": 100,
   "buyUnit": "pacote"
  }
 ],
 "zones": [
  {
   "name": "ADE CONJUNTO 1",
   "fee": 7
  },
  {
   "name": "ADE CONJUNTO 15",
   "fee": 7
  },
  {
   "name": "QI 616",
   "fee": 8
  },
  {
   "name": "QN 101 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 102 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 103 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 1033 Samambaia Norte",
   "fee": 17
  },
  {
   "name": "QN 104 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 105 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 106 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 107 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QN 108 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QN 109 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QN 110 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QN 111",
   "fee": 7
  },
  {
   "name": "QN 112 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QN 113",
   "fee": 7
  },
  {
   "name": "QN 114",
   "fee": 5
  },
  {
   "name": "QN 114 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 115",
   "fee": 7
  },
  {
   "name": "QN 116 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 117",
   "fee": 7
  },
  {
   "name": "QN 118 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 119",
   "fee": 9
  },
  {
   "name": "QN 120 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 121",
   "fee": 9
  },
  {
   "name": "QN 122 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 123",
   "fee": 9
  },
  {
   "name": "QN 125",
   "fee": 9
  },
  {
   "name": "QN 202 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QN 203 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QN 204 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QN 206",
   "fee": 7
  },
  {
   "name": "QN 208",
   "fee": 7
  },
  {
   "name": "QN 210",
   "fee": 7
  },
  {
   "name": "QN 301 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 302 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 303 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 304 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 305 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 306 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 307 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 308 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QN 309 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QN 310 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QN 311 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QN 312 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QN 313",
   "fee": 7
  },
  {
   "name": "QN 314 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QN 315 Samambaia Sul",
   "fee": 7
  },
  {
   "name": "QN 316 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 317",
   "fee": 7
  },
  {
   "name": "QN 318 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 319",
   "fee": 8
  },
  {
   "name": "QN 320 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 321",
   "fee": 9
  },
  {
   "name": "QN 322 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 323",
   "fee": 9
  },
  {
   "name": "QN 325",
   "fee": 10
  },
  {
   "name": "QN 327 Samambaia Sul",
   "fee": 10
  },
  {
   "name": "QN 401 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QN 402 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QN 403 Samambaia Norte",
   "fee": 7
  },
  {
   "name": "QN 404 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QN 405",
   "fee": 7
  },
  {
   "name": "QN 406 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QN 407",
   "fee": 7
  },
  {
   "name": "QN 408 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QN 409",
   "fee": 7
  },
  {
   "name": "QN 410 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QN 411 Samambaia Norte",
   "fee": 7
  },
  {
   "name": "QN 412 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QN 413",
   "fee": 8
  },
  {
   "name": "QN 414 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QN 415",
   "fee": 8
  },
  {
   "name": "QN 416",
   "fee": 7
  },
  {
   "name": "QN 417",
   "fee": 8
  },
  {
   "name": "QN 418",
   "fee": 7
  },
  {
   "name": "QN 419",
   "fee": 10
  },
  {
   "name": "QN 420",
   "fee": 7
  },
  {
   "name": "QN 421",
   "fee": 10
  },
  {
   "name": "QN 423 Samambaia Norte",
   "fee": 10
  },
  {
   "name": "QN 425 Samambaia Norte",
   "fee": 10
  },
  {
   "name": "QN 427 Samambaia Norte",
   "fee": 12
  },
  {
   "name": "QN 429 Samambaia Norte",
   "fee": 13
  },
  {
   "name": "QN 501 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QN 502 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 503 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QN 504 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 505 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QN 506 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 507 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QN 508 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 509",
   "fee": 7
  },
  {
   "name": "QN 510 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 511",
   "fee": 7
  },
  {
   "name": "QN 512 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 513",
   "fee": 7
  },
  {
   "name": "QN 514 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 515",
   "fee": 8
  },
  {
   "name": "QN 516 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 517",
   "fee": 8
  },
  {
   "name": "QN 518 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QN 519",
   "fee": 8
  },
  {
   "name": "QN 520 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QN 521",
   "fee": 10
  },
  {
   "name": "QN 522 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QN 523",
   "fee": 10
  },
  {
   "name": "QN 525",
   "fee": 10
  },
  {
   "name": "QN 601 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QN 602 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QN 603",
   "fee": 7
  },
  {
   "name": "QN 604",
   "fee": 7
  },
  {
   "name": "QN 605",
   "fee": 8
  },
  {
   "name": "QN 606",
   "fee": 7
  },
  {
   "name": "QN 607 Samambaia Norte",
   "fee": 8
  },
  {
   "name": "QN 608 Samambaia Norte",
   "fee": 7
  },
  {
   "name": "QN 609",
   "fee": 8
  },
  {
   "name": "QN 610",
   "fee": 8
  },
  {
   "name": "QN 611",
   "fee": 8
  },
  {
   "name": "QN 612",
   "fee": 8
  },
  {
   "name": "QN 613",
   "fee": 8
  },
  {
   "name": "QN 614",
   "fee": 8
  },
  {
   "name": "QN 615",
   "fee": 9
  },
  {
   "name": "QN 616",
   "fee": 8
  },
  {
   "name": "QN 617",
   "fee": 9
  },
  {
   "name": "QN 619",
   "fee": 9
  },
  {
   "name": "QN 621 Samambaia Norte",
   "fee": 10
  },
  {
   "name": "QN 623 Samambaia Norte",
   "fee": 10
  },
  {
   "name": "QN 629 Samambaia Norte",
   "fee": 15
  },
  {
   "name": "QR 101 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 102 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 103 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 1031 Samambaia Norte",
   "fee": 16
  },
  {
   "name": "QR 1033 Samambaia Norte",
   "fee": 17
  },
  {
   "name": "QR 104 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 105 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 106 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 107 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QR 108 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QR 109 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QR 110 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QR 111",
   "fee": 7
  },
  {
   "name": "QR 112 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QR 113",
   "fee": 7
  },
  {
   "name": "QR 114 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 115",
   "fee": 7
  },
  {
   "name": "QR 116 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 117",
   "fee": 7
  },
  {
   "name": "QR 118 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 119",
   "fee": 9
  },
  {
   "name": "QR 120 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 121",
   "fee": 9
  },
  {
   "name": "QR 122 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 123",
   "fee": 9
  },
  {
   "name": "QR 125",
   "fee": 9
  },
  {
   "name": "QR 201 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QR 202 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QR 203 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QR 204 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QR 205 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QR 206",
   "fee": 7
  },
  {
   "name": "QR 207",
   "fee": 7
  },
  {
   "name": "QR 208",
   "fee": 7
  },
  {
   "name": "QR 209",
   "fee": 7
  },
  {
   "name": "QR 210",
   "fee": 7
  },
  {
   "name": "QR 211 Samambaia Norte",
   "fee": 7
  },
  {
   "name": "QR 212 Samambaia Norte",
   "fee": 7
  },
  {
   "name": "QR 213",
   "fee": 8
  },
  {
   "name": "QR 214 Samambaia Norte",
   "fee": 7
  },
  {
   "name": "QR 215",
   "fee": 8
  },
  {
   "name": "QR 217",
   "fee": 9
  },
  {
   "name": "QR 219",
   "fee": 9
  },
  {
   "name": "QR 221 Samambaia Norte",
   "fee": 9
  },
  {
   "name": "QR 223 Samambaia Norte",
   "fee": 10
  },
  {
   "name": "QR 301 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 302 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 303 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 304 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 305 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 306 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 307 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 308 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QR 309 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QR 310 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QR 311 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QR 312 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QR 313 Samambaia Sul",
   "fee": 7
  },
  {
   "name": "QR 314 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QR 315",
   "fee": 7
  },
  {
   "name": "QR 316 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 317",
   "fee": 7
  },
  {
   "name": "QR 318 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 319",
   "fee": 8
  },
  {
   "name": "QR 320 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 321",
   "fee": 9
  },
  {
   "name": "QR 322 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 323",
   "fee": 9
  },
  {
   "name": "QR 325",
   "fee": 10
  },
  {
   "name": "QR 327 Samambaia Sul",
   "fee": 10
  },
  {
   "name": "QR 401 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QR 402 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QR 403",
   "fee": 7
  },
  {
   "name": "QR 404 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QR 405 Samambaia Norte",
   "fee": 7
  },
  {
   "name": "QR 406 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QR 407",
   "fee": 7
  },
  {
   "name": "QR 408 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QR 409",
   "fee": 7
  },
  {
   "name": "QR 410 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QR 411 Samambaia Norte",
   "fee": 7
  },
  {
   "name": "QR 412 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QR 413",
   "fee": 8
  },
  {
   "name": "QR 414 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QR 415",
   "fee": 8
  },
  {
   "name": "QR 416",
   "fee": 7
  },
  {
   "name": "QR 417",
   "fee": 8
  },
  {
   "name": "QR 418",
   "fee": 7
  },
  {
   "name": "QR 419",
   "fee": 10
  },
  {
   "name": "QR 420",
   "fee": 7
  },
  {
   "name": "QR 421",
   "fee": 10
  },
  {
   "name": "QR 423",
   "fee": 10
  },
  {
   "name": "QR 425 Samambaia Norte",
   "fee": 10
  },
  {
   "name": "QR 427 Samambaia Norte",
   "fee": 12
  },
  {
   "name": "QR 429 Samambaia Norte",
   "fee": 13
  },
  {
   "name": "QR 431 Samambaia Norte",
   "fee": 15
  },
  {
   "name": "QR 433 Samambaia Norte",
   "fee": 15
  },
  {
   "name": "QR 501 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QR 502 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 503 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QR 504 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 505 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QR 506 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 507 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QR 508 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 509",
   "fee": 7
  },
  {
   "name": "QR 510 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 511",
   "fee": 7
  },
  {
   "name": "QR 512 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 513",
   "fee": 7
  },
  {
   "name": "QR 514 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 515",
   "fee": 8
  },
  {
   "name": "QR 516 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QR 517",
   "fee": 8
  },
  {
   "name": "QR 518 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QR 519",
   "fee": 8
  },
  {
   "name": "QR 520 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QR 521",
   "fee": 10
  },
  {
   "name": "QR 522 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QR 523",
   "fee": 10
  },
  {
   "name": "QR 525",
   "fee": 10
  },
  {
   "name": "QR 601 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QR 602 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QR 603",
   "fee": 7
  },
  {
   "name": "QR 604",
   "fee": 7
  },
  {
   "name": "QR 605",
   "fee": 8
  },
  {
   "name": "QR 606",
   "fee": 7
  },
  {
   "name": "QR 607",
   "fee": 8
  },
  {
   "name": "QR 608 Samambaia Norte",
   "fee": 7
  },
  {
   "name": "QR 609",
   "fee": 8
  },
  {
   "name": "QR 610 Samambaia Norte",
   "fee": 8
  },
  {
   "name": "QR 611",
   "fee": 8
  },
  {
   "name": "QR 612",
   "fee": 8
  },
  {
   "name": "QR 613 Samambaia Norte",
   "fee": 8
  },
  {
   "name": "QR 614",
   "fee": 8
  },
  {
   "name": "QR 615",
   "fee": 9
  },
  {
   "name": "QR 616 Samambaia Norte",
   "fee": 8
  },
  {
   "name": "QR 617 Samambaia Norte",
   "fee": 9
  },
  {
   "name": "QR 619",
   "fee": 9
  },
  {
   "name": "QR 621 Samambaia Norte",
   "fee": 10
  },
  {
   "name": "QR 623 Samambaia Norte",
   "fee": 10
  },
  {
   "name": "QR 629 Samambaia Norte",
   "fee": 15
  },
  {
   "name": "QR 631 Samambaia Norte",
   "fee": 15
  },
  {
   "name": "QS 101 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 102 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 103 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 104 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 105 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 106 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 107 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QS 108 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QS 109 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QS 110 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QS 111",
   "fee": 7
  },
  {
   "name": "QS 112 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QS 113",
   "fee": 7
  },
  {
   "name": "QS 114 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 115",
   "fee": 7
  },
  {
   "name": "QS 116 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 117",
   "fee": 7
  },
  {
   "name": "QS 118 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 119",
   "fee": 9
  },
  {
   "name": "QS 120 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 121",
   "fee": 9
  },
  {
   "name": "QS 122 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 123",
   "fee": 9
  },
  {
   "name": "QS 125",
   "fee": 9
  },
  {
   "name": "QS 202 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QS 204 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QS 206",
   "fee": 7
  },
  {
   "name": "QS 208",
   "fee": 7
  },
  {
   "name": "QS 210",
   "fee": 7
  },
  {
   "name": "QS 212",
   "fee": 7
  },
  {
   "name": "QS 301 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 302 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 303 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 304 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 305 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 306 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 307 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 308 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QS 309 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QS 310 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QS 311 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QS 312 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QS 313",
   "fee": 7
  },
  {
   "name": "QS 314 Samambaia Sul",
   "fee": 4
  },
  {
   "name": "QS 315 Samambaia Sul",
   "fee": 7
  },
  {
   "name": "QS 316 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 317",
   "fee": 7
  },
  {
   "name": "QS 318 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 319",
   "fee": 8
  },
  {
   "name": "QS 320 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 321",
   "fee": 9
  },
  {
   "name": "QS 322 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 323",
   "fee": 9
  },
  {
   "name": "QS 325",
   "fee": 10
  },
  {
   "name": "QS 327 Samambaia Sul",
   "fee": 10
  },
  {
   "name": "QS 401 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QS 402 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QS 403",
   "fee": 7
  },
  {
   "name": "QS 404 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QS 405",
   "fee": 7
  },
  {
   "name": "QS 406 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QS 407",
   "fee": 7
  },
  {
   "name": "QS 408 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QS 409",
   "fee": 7
  },
  {
   "name": "QS 410 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QS 411",
   "fee": 7
  },
  {
   "name": "QS 412 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QS 413",
   "fee": 8
  },
  {
   "name": "QS 414 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QS 415",
   "fee": 8
  },
  {
   "name": "QS 416",
   "fee": 7
  },
  {
   "name": "QS 417",
   "fee": 8
  },
  {
   "name": "QS 418",
   "fee": 7
  },
  {
   "name": "QS 419",
   "fee": 10
  },
  {
   "name": "QS 420 Samambaia Norte",
   "fee": 7
  },
  {
   "name": "QS 421",
   "fee": 10
  },
  {
   "name": "QS 423",
   "fee": 10
  },
  {
   "name": "QS 425 Samambaia Norte",
   "fee": 10
  },
  {
   "name": "QS 427 Samambaia Norte",
   "fee": 12
  },
  {
   "name": "QS 429 Samambaia Norte",
   "fee": 13
  },
  {
   "name": "QS 501 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QS 502 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 503 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QS 504 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 505 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QS 506 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 507 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QS 508 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 509",
   "fee": 7
  },
  {
   "name": "QS 510 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 511",
   "fee": 7
  },
  {
   "name": "QS 512 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 513",
   "fee": 7
  },
  {
   "name": "QS 514 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 515",
   "fee": 8
  },
  {
   "name": "QS 516 Samambaia Sul",
   "fee": 5
  },
  {
   "name": "QS 517",
   "fee": 8
  },
  {
   "name": "QS 518 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QS 519",
   "fee": 8
  },
  {
   "name": "QS 520 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QS 521",
   "fee": 10
  },
  {
   "name": "QS 522 Samambaia Sul",
   "fee": 6
  },
  {
   "name": "QS 523",
   "fee": 10
  },
  {
   "name": "QS 525",
   "fee": 10
  },
  {
   "name": "QS 601 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QS 602 Samambaia Norte",
   "fee": 6
  },
  {
   "name": "QS 603",
   "fee": 7
  },
  {
   "name": "QS 604",
   "fee": 7
  },
  {
   "name": "QS 605",
   "fee": 8
  },
  {
   "name": "QS 606 Samambaia Norte",
   "fee": 7
  },
  {
   "name": "QS 607 Samambaia Norte",
   "fee": 8
  },
  {
   "name": "QS 608 Samambaia Norte",
   "fee": 7
  },
  {
   "name": "QS 609",
   "fee": 8
  },
  {
   "name": "QS 610",
   "fee": 8
  },
  {
   "name": "QS 611",
   "fee": 8
  },
  {
   "name": "QS 612",
   "fee": 8
  },
  {
   "name": "QS 613",
   "fee": 8
  },
  {
   "name": "QS 614",
   "fee": 8
  },
  {
   "name": "QS 615 Samambaia Norte",
   "fee": 9
  },
  {
   "name": "QS 616",
   "fee": 8
  },
  {
   "name": "QS 617",
   "fee": 9
  },
  {
   "name": "QS 619",
   "fee": 9
  },
  {
   "name": "QS 621 Samambaia Norte",
   "fee": 10
  },
  {
   "name": "QS 623 Samambaia Norte",
   "fee": 10
  },
  {
   "name": "QS 629 Samambaia Norte",
   "fee": 15
  },
  {
   "name": "SMSE Samambaia Sul",
   "fee": 7
  }
 ]
};
