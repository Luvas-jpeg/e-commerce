import { Product } from '../context/CartContext';

export const products: Product[] = [
  // Equipamentos Médicos
  {
    id: '1',
    name: 'Estetoscópio Profissional',
    price: 289.90,
    type: 'equipment',
    image: 'https://images.unsplash.com/photo-1655313719612-8248b2c4d1e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZXF1aXBtZW50JTIwc3RldGhvc2NvcGV8ZW58MXx8fHwxNzczNTE3MTExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Estetoscópio de alta precisão com membrana dupla, ideal para ausculta cardíaca e pulmonar.',
    category: 'Diagnóstico',
    stock: 15
  },
  {
    id: '2',
    name: 'Monitor de Sinais Vitais',
    price: 3599.00,
    type: 'equipment',
    image: 'https://images.unsplash.com/photo-1770836037704-44bd8c7b6978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3NwaXRhbCUyMGVxdWlwbWVudCUyMG1vbml0b3J8ZW58MXx8fHwxNzczNTE3MTEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Monitor multiparamétrico com tela colorida para monitoramento de pressão arterial, frequência cardíaca e oximetria.',
    category: 'Monitoramento',
    stock: 8
  },
  {
    id: '3',
    name: 'Luvas Cirúrgicas Estéreis - Caixa com 50 pares',
    price: 159.90,
    type: 'equipment',
    image: 'https://images.unsplash.com/photo-1758206523660-3ef5a51f1113?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZ2xvdmVzJTIwc3VyZ2ljYWx8ZW58MXx8fHwxNzczNTE3MTEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Luvas cirúrgicas em látex, estéreis e de alta qualidade. Tamanhos variados disponíveis.',
    category: 'EPI',
    stock: 50
  },
  {
    id: '4',
    name: 'Desfibrilador Automático Externo (DEA)',
    price: 8999.00,
    type: 'equipment',
    image: 'https://images.unsplash.com/photo-1762161916712-09592fa05b20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWZpYnJpbGxhdG9yJTIwZW1lcmdlbmN5JTIwbWVkaWNhbHxlbnwxfHx8fDE3NzM1MTcxMTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'DEA portátil com instruções de voz e análise automática do ritmo cardíaco. Ideal para ambientes públicos.',
    category: 'Emergência',
    stock: 5
  },
  
  // Cursos Presenciais
  {
    id: '5',
    name: 'Curso de Primeiros Socorros Básico',
    price: 450.00,
    type: 'course',
    image: 'https://images.unsplash.com/photo-1622115585848-1d5b6e8af4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJzdCUyMGFpZCUyMHRyYWluaW5nfGVufDF8fHx8MTc3MzUxNzExM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Aprenda técnicas essenciais de primeiros socorros, RCP e uso de DEA. Certificado reconhecido nacionalmente.',
    date: '15/04/2026 - 16/04/2026',
    location: 'São Paulo - SP',
    instructor: 'Dr. Carlos Silva',
    stock: 20
  },
  {
    id: '6',
    name: 'Curso de Suporte Avançado de Vida (ACLS)',
    price: 1200.00,
    type: 'course',
    image: 'https://images.unsplash.com/photo-1659353887019-b142198f2668?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdHJhaW5pbmclMjBjb3Vyc2V8ZW58MXx8fHwxNzczNTE3MTEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Treinamento avançado para profissionais de saúde em emergências cardiovasculares. Carga horária de 16h.',
    date: '22/04/2026 - 23/04/2026',
    location: 'Rio de Janeiro - RJ',
    instructor: 'Dra. Ana Paula Costa',
    stock: 15
  },
  {
    id: '7',
    name: 'Workshop de Técnicas de Sutura',
    price: 890.00,
    type: 'course',
    image: 'https://images.unsplash.com/photo-1659353887019-b142198f2668?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdHJhaW5pbmclMjBjb3Vyc2V8ZW58MXx8fHwxNzczNTE3MTEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Práticas intensivas de diferentes técnicas de sutura em modelos sintéticos. Aula prática com supervisão.',
    date: '10/05/2026',
    location: 'Belo Horizonte - MG',
    instructor: 'Dr. Roberto Mendes',
    stock: 12
  },
  {
    id: '8',
    name: 'Curso de Biossegurança Hospitalar',
    price: 350.00,
    type: 'course',
    image: 'https://images.unsplash.com/photo-1622115585848-1d5b6e8af4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJzdCUyMGFpZCUyMHRyYWluaW5nfGVufDF8fHx8MTc3MzUxNzExM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Normas e práticas de biossegurança em ambientes hospitalares. Essencial para toda equipe de saúde.',
    date: '18/04/2026',
    location: 'Curitiba - PR',
    instructor: 'Enf. Marina Oliveira',
    stock: 25
  }
];
