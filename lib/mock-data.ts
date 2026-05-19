import type { User, AccessGroup, Post, Document, Subscriber } from './types'

// Grupos de Acesso Padrão
export const defaultGroups: AccessGroup[] = [
  {
    id: 'group-admin',
    name: 'Administradores',
    permissions: [
      'view_public_docs',
      'view_private_docs',
      'upload_docs',
      'manage_users',
      'manage_groups',
      'manage_posts',
    ],
    level: 10,
  },
  {
    id: 'group-professor',
    name: 'Professores',
    permissions: ['view_public_docs', 'view_private_docs', 'upload_docs', 'manage_posts'],
    level: 7,
  },
  {
    id: 'group-aluno',
    name: 'Alunos',
    permissions: ['view_public_docs'],
    level: 3,
  },
  {
    id: 'group-visitante',
    name: 'Visitantes',
    permissions: ['view_public_docs'],
    level: 1,
  },
]

// Usuários Padrão
export const defaultUsers: User[] = [
  {
    id: 'user-admin',
    username: 'admin',
    email: 'admin@mural.com',
    password: 'admin123',
    phone: '(11) 99999-9999',
    groupId: 'group-admin',
    isAdmin: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'user-professor',
    username: 'professor',
    email: 'professor@mural.com',
    password: 'prof123',
    phone: '(11) 98888-8888',
    groupId: 'group-professor',
    isAdmin: false,
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'user-aluno',
    username: 'aluno',
    email: 'aluno@mural.com',
    password: 'aluno123',
    groupId: 'group-aluno',
    isAdmin: false,
    createdAt: '2024-02-01T00:00:00.000Z',
  },
]

// Posts do Blog
export const defaultPosts: Post[] = [
  {
    id: 'post-1',
    slug: 'semana-academica-2024',
    title: 'Semana Acadêmica 2024: Inscrições Abertas',
    excerpt:
      'Participe da maior semana acadêmica da nossa universidade com palestras, workshops e networking.',
    content: `# Semana Acadêmica 2024

A **Semana Acadêmica 2024** está chegando! Este é o maior evento anual da nossa universidade, reunindo estudantes, professores e profissionais do mercado.

## Datas Importantes

- **Início**: 15 de Março de 2024
- **Término**: 22 de Março de 2024
- **Inscrições**: Até 10 de Março

## Programação

### Segunda-feira - Abertura
- 09:00 - Cerimônia de abertura
- 14:00 - Palestra: "O Futuro das Tecnologias"
- 19:00 - Coquetel de networking

### Terça a Quinta - Workshops
- Diversos workshops técnicos
- Mesas redondas com profissionais
- Apresentação de trabalhos

### Sexta-feira - Encerramento
- Apresentação dos melhores trabalhos
- Premiação
- Confraternização

## Como se Inscrever

1. Acesse o portal do aluno
2. Clique em "Eventos"
3. Selecione "Semana Acadêmica 2024"
4. Preencha o formulário

**Vagas limitadas!** Garanta já a sua participação.

---

*Coordenação de Eventos Acadêmicos*`,
    author: 'Coordenação Acadêmica',
    category: 'eventos',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    createdAt: '2024-02-15T10:00:00.000Z',
    updatedAt: '2024-02-15T10:00:00.000Z',
  },
  {
    id: 'post-2',
    slug: 'vagas-estagio-tecnologia',
    title: 'Novas Vagas de Estágio em Tecnologia',
    excerpt:
      'Empresas parceiras abriram vagas exclusivas para nossos alunos nas áreas de desenvolvimento e dados.',
    content: `# Vagas de Estágio em Tecnologia

Temos o prazer de anunciar novas parcerias com empresas líderes do setor de tecnologia!

## Vagas Disponíveis

### Empresa Tech Solutions
- **Cargo**: Estagiário de Desenvolvimento Web
- **Bolsa**: R$ 1.800,00
- **Carga Horária**: 6h/dia
- **Requisitos**: Cursando a partir do 3º semestre

### Empresa DataCorp
- **Cargo**: Estagiário de Ciência de Dados
- **Bolsa**: R$ 2.000,00
- **Carga Horária**: 6h/dia
- **Requisitos**: Conhecimento em Python e SQL

### Empresa CloudSoft
- **Cargo**: Estagiário de DevOps
- **Bolsa**: R$ 1.900,00
- **Carga Horária**: 6h/dia
- **Requisitos**: Conhecimento básico em Linux

## Benefícios

- Vale transporte
- Vale refeição
- Plano de saúde
- Possibilidade de efetivação

## Como se Candidatar

Envie seu currículo para **estagios@mural.edu.br** com o assunto indicando a vaga desejada.

**Prazo**: Até 28 de Fevereiro de 2024

---

*Núcleo de Carreiras*`,
    author: 'Núcleo de Carreiras',
    category: 'estagios',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    createdAt: '2024-02-10T14:30:00.000Z',
    updatedAt: '2024-02-10T14:30:00.000Z',
  },
  {
    id: 'post-3',
    slug: 'novo-laboratorio-ia',
    title: 'Inauguração do Novo Laboratório de IA',
    excerpt:
      'A universidade inaugura laboratório de última geração dedicado a pesquisas em Inteligência Artificial.',
    content: `# Novo Laboratório de Inteligência Artificial

Com grande satisfação, anunciamos a inauguração do **Laboratório de Inteligência Artificial** da nossa universidade!

## Infraestrutura

O laboratório conta com:

- 20 estações de trabalho de alta performance
- Servidor com GPUs NVIDIA A100
- Ambiente de desenvolvimento em nuvem
- Sala de reuniões para equipes de pesquisa

## Áreas de Pesquisa

1. **Machine Learning**
2. **Processamento de Linguagem Natural**
3. **Visão Computacional**
4. **Robótica Inteligente**

## Horário de Funcionamento

| Dia | Horário |
|-----|---------|
| Segunda a Sexta | 08:00 - 22:00 |
| Sábado | 08:00 - 14:00 |

## Agendamento

Para utilizar o laboratório, é necessário:

1. Ser aluno regularmente matriculado
2. Ter projeto de pesquisa aprovado
3. Realizar agendamento online

\`\`\`
Acesse: portal.mural.edu.br/laboratorios
\`\`\`

---

*Pró-Reitoria de Pesquisa e Inovação*`,
    author: 'Pró-Reitoria de Pesquisa',
    category: 'anuncios',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
    createdAt: '2024-02-05T09:00:00.000Z',
    updatedAt: '2024-02-05T09:00:00.000Z',
  },
  {
    id: 'post-4',
    slug: 'resultado-vestibular-2024',
    title: 'Resultado do Vestibular 2024.1 Divulgado',
    excerpt: 'Confira a lista de aprovados no vestibular do primeiro semestre de 2024.',
    content: `# Resultado do Vestibular 2024.1

O resultado do processo seletivo **Vestibular 2024.1** já está disponível!

## Consulta de Resultado

Para consultar seu resultado:

1. Acesse [portal.mural.edu.br/vestibular](https://portal.mural.edu.br/vestibular)
2. Informe seu CPF e data de nascimento
3. Visualize sua classificação

## Matrículas

### 1ª Chamada
- **Período**: 20 a 25 de Fevereiro
- **Local**: Secretaria Acadêmica

### 2ª Chamada
- **Período**: 27 de Fevereiro a 01 de Março
- **Local**: Secretaria Acadêmica

## Documentos Necessários

- RG e CPF (original e cópia)
- Histórico Escolar do Ensino Médio
- Certificado de Conclusão
- Comprovante de Residência
- 2 fotos 3x4

## Importante

> Os candidatos aprovados que não realizarem a matrícula no prazo perderão a vaga.

Parabéns a todos os aprovados! Bem-vindos à família Mural Universitário!

---

*Comissão do Vestibular*`,
    author: 'Comissão do Vestibular',
    category: 'noticias',
    coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
    createdAt: '2024-02-01T08:00:00.000Z',
    updatedAt: '2024-02-01T08:00:00.000Z',
  },
  {
    id: 'post-5',
    slug: 'palestra-empreendedorismo',
    title: 'Palestra: Empreendedorismo Digital',
    excerpt: 'CEO de startup unicórnio compartilha sua trajetória em palestra exclusiva.',
    content: `# Palestra: Empreendedorismo Digital

Convido todos para uma palestra especial sobre **Empreendedorismo Digital**!

## Palestrante

**João Silva** - CEO e fundador da TechStart

- Fundou sua primeira startup aos 22 anos
- Alcançou status de unicórnio em 5 anos
- Forbes Under 30 em 2022

## Temas Abordados

- Como identificar oportunidades de negócio
- Validação de ideias com MVP
- Captação de investimentos
- Escalando sua startup

## Informações

- **Data**: 25 de Março de 2024
- **Horário**: 19:00 às 21:30
- **Local**: Auditório Principal
- **Vagas**: 300 lugares

## Inscrição

A inscrição é **gratuita** e pode ser feita pelo portal do aluno.

Certificado de participação disponível!

---

*Incubadora de Negócios*`,
    author: 'Incubadora de Negócios',
    category: 'eventos',
    coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
    createdAt: '2024-01-28T16:00:00.000Z',
    updatedAt: '2024-01-28T16:00:00.000Z',
  },
  {
    id: 'post-6',
    slug: 'programa-intercambio',
    title: 'Programa de Intercâmbio Internacional 2024',
    excerpt: 'Inscrições abertas para intercâmbio em universidades parceiras na Europa e EUA.',
    content: `# Programa de Intercâmbio Internacional 2024

Estão abertas as inscrições para o programa de intercâmbio acadêmico!

## Universidades Parceiras

### Europa
- Universidade de Lisboa (Portugal)
- Politécnico de Milão (Itália)
- Universidad de Barcelona (Espanha)

### Estados Unidos
- MIT (Massachusetts)
- Stanford University (Califórnia)
- NYU (Nova York)

## Requisitos

- Estar matriculado a partir do 4º semestre
- Coeficiente de rendimento mínimo: 7.0
- Comprovação de proficiência no idioma

## Bolsas Disponíveis

| Destino | Valor Mensal |
|---------|--------------|
| Europa | € 1.200 |
| EUA | $ 1.800 |

## Cronograma

1. **Inscrições**: Março/2024
2. **Seleção**: Abril/2024
3. **Resultado**: Maio/2024
4. **Embarque**: Agosto/2024

---

*Escritório de Relações Internacionais*`,
    author: 'Relações Internacionais',
    category: 'anuncios',
    coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
    createdAt: '2024-01-25T11:00:00.000Z',
    updatedAt: '2024-01-25T11:00:00.000Z',
  },
]

// Documentos Padrão
export const defaultDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Manual do Aluno 2024',
    fileName: 'manual_aluno_2024.pdf',
    fileType: 'application/pdf',
    fileSize: 2500000,
    isPublic: true,
    isKnowledgeBase: true,
    minAccessLevel: 1,
    uploadedBy: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'doc-2',
    name: 'Calendário Acadêmico 2024',
    fileName: 'calendario_2024.pdf',
    fileType: 'application/pdf',
    fileSize: 500000,
    isPublic: true,
    isKnowledgeBase: true,
    minAccessLevel: 1,
    uploadedBy: 'admin',
    createdAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'doc-3',
    name: 'Regimento Interno',
    fileName: 'regimento_interno.pdf',
    fileType: 'application/pdf',
    fileSize: 1800000,
    isPublic: true,
    isKnowledgeBase: true,
    minAccessLevel: 1,
    uploadedBy: 'admin',
    createdAt: '2024-01-03T00:00:00.000Z',
  },
  {
    id: 'doc-4',
    name: 'Grade Curricular - Engenharia',
    fileName: 'grade_engenharia.pdf',
    fileType: 'application/pdf',
    fileSize: 350000,
    isPublic: false,
    isKnowledgeBase: false,
    minAccessLevel: 3,
    uploadedBy: 'professor',
    createdAt: '2024-01-10T00:00:00.000Z',
  },
  {
    id: 'doc-5',
    name: 'Relatório Financeiro Q4 2023',
    fileName: 'relatorio_financeiro_q4.xlsx',
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileSize: 890000,
    isPublic: false,
    isKnowledgeBase: false,
    minAccessLevel: 7,
    uploadedBy: 'admin',
    createdAt: '2024-01-15T00:00:00.000Z',
  },
]

// Subscribers Padrão
export const defaultSubscribers: Subscriber[] = [
  {
    id: 'sub-1',
    email: 'maria@email.com',
    subscribedAt: '2024-01-10T00:00:00.000Z',
  },
  {
    id: 'sub-2',
    email: 'joao@email.com',
    subscribedAt: '2024-01-15T00:00:00.000Z',
  },
]
