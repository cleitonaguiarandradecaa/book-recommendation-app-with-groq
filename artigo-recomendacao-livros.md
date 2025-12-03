# SISTEMA DE RECOMENDAÇÃO DE LIVROS BASEADO EM INTELIGÊNCIA ARTIFICIAL E PROCESSAMENTO DE LINGUAGEM NATURAL

## RESUMO

Este artigo apresenta o desenvolvimento de um sistema de recomendação de livros inteligente que utiliza processamento de linguagem natural (PLN) e modelos de linguagem de grande escala (LLMs) para personalizar recomendações literárias. O sistema integra a API do Google Books para busca de títulos e a API Groq (modelo Llama 3.1) para análise semântica de mensagens do usuário, extração de termos de busca, inferência de contexto em consultas ambíguas e geração de explicações personalizadas para cada recomendação. A aplicação foi desenvolvida utilizando Next.js, React e armazenamento local (localStorage) para gerenciamento de estado e persistência de dados do usuário. O sistema implementa um processo de onboarding que coleta preferências de gêneros literários, tempo disponível para leitura e nível de experiência do leitor, utilizando essas informações para filtrar e personalizar recomendações. Além disso, o sistema oferece funcionalidades de chat conversacional com inferência de contexto, permitindo que consultas ambíguas sejam interpretadas e confirmadas com o usuário antes da busca. Os resultados demonstram que a integração de LLMs melhora significativamente a precisão das recomendações e a experiência do usuário, gerando explicações contextualizadas que relacionam características dos livros com os interesses pessoais do leitor.

**Palavras-chave:** Recomendação de livros. Inteligência artificial. Processamento de linguagem natural. Sistemas de recomendação. Personalização.

---

## 1. INTRODUÇÃO

### 1.1 Contextualização

A crescente disponibilidade de conteúdo literário digital e a necessidade de personalização na descoberta de livros têm impulsionado o desenvolvimento de sistemas inteligentes de recomendação. Tradicionais sistemas baseados em filtragem colaborativa ou conteúdo apresentam limitações na compreensão de intenções do usuário expressas em linguagem natural, especialmente em consultas ambíguas ou genéricas.

### 1.2 Problema de Pesquisa

Como desenvolver um sistema de recomendação de livros que compreenda intenções do usuário expressas em linguagem natural, personalize recomendações baseadas em preferências coletadas durante o onboarding e gere explicações contextualizadas para cada sugestão?

### 1.3 Objetivos

#### 1.3.1 Objetivo Geral

Desenvolver um sistema de recomendação de livros que utilize inteligência artificial para processar consultas em linguagem natural, personalizar recomendações baseadas em preferências do usuário e gerar explicações contextualizadas para cada livro sugerido.

#### 1.3.2 Objetivos Específicos

- Implementar um sistema de chat conversacional capaz de detectar intenções de busca de livros em mensagens do usuário;
- Desenvolver mecanismo de extração de termos de busca utilizando modelos de linguagem para interpretar consultas em português;
- Criar sistema de inferência de contexto para interpretar consultas ambíguas e solicitar confirmação ao usuário;
- Implementar geração automática de explicações personalizadas para cada livro recomendado, relacionando características do livro com interesses do usuário;
- Integrar API do Google Books para busca e recuperação de informações bibliográficas;
- Desenvolver sistema de onboarding para coleta de preferências (gêneros, tempo de leitura, nível de experiência);
- Implementar funcionalidades de gerenciamento de recomendações, favoritos e planos de leitura personalizados.

### 1.4 Justificativa

A aplicação de técnicas de PLN e LLMs em sistemas de recomendação permite uma interação mais natural e intuitiva com o usuário, melhorando a precisão das sugestões e a satisfação do usuário. Este trabalho contribui para o avanço da área de sistemas de recomendação inteligentes aplicados ao domínio literário.

### 1.5 Estrutura do Trabalho

Este artigo está organizado em cinco seções principais: Introdução, Desenvolvimento (com subseções de Metodologia, Análise e Discussão de Resultados), Considerações Finais e Referências.

---

## 2. DESENVOLVIMENTO

### 2.1 METODOLOGIA

#### 2.1.1 Arquitetura do Sistema

O sistema foi desenvolvido utilizando uma arquitetura de aplicação web moderna baseada em Next.js (framework React), com separação entre frontend e backend através de API Routes. A persistência de dados é realizada no cliente utilizando localStorage, permitindo que informações do usuário (preferências, recomendações, favoritos, planos de leitura) sejam mantidas entre sessões.

#### 2.1.2 Tecnologias e Ferramentas

- **Next.js 14+**: Framework React para desenvolvimento full-stack;
- **React Context API**: Gerenciamento de estado global da aplicação;
- **Groq API (Llama 3.1 8B Instant)**: Modelo de linguagem para processamento de mensagens, extração de termos, inferência de contexto e geração de explicações;
- **Google Books API**: Fonte de dados bibliográficos e metadados de livros;
- **TypeScript**: Tipagem estática para maior robustez do código;
- **Shadcn UI**: Componentes de interface reutilizáveis.

#### 2.1.3 Processo de Onboarding

O sistema implementa um processo de onboarding inicial que coleta três tipos de informações do usuário:

1. **Gêneros literários de interesse**: Seleção múltipla entre opções como ficção científica, fantasia, romance, mistério, aventura, entre outros;
2. **Tempo disponível para leitura diária**: Valor em minutos selecionado através de slider;
3. **Nível de experiência do leitor**: Classificação em iniciante, intermediário ou avançado.

Essas informações são armazenadas no contexto de autenticação e utilizadas para personalizar todas as recomendações subsequentes.

#### 2.1.4 Detecção de Intenção de Busca

O sistema implementa uma função `shouldSearchBooks()` que analisa mensagens do usuário procurando por palavras-chave em português e espanhol que indicam intenção de busca de livros, tais como "recomendar livro", "quero livros sobre", "buscar livros", entre outras. Quando uma intenção de busca é detectada, o sistema ativa o fluxo de busca na API do Google Books.

#### 2.1.5 Extração de Termos de Busca com IA

Para consultas específicas, o sistema utiliza a API Groq para extrair termos de busca relevantes da mensagem do usuário. A função `extractSearchTermsWithAI()` envia um prompt estruturado ao modelo Llama 3.1 solicitando apenas os termos de busca, sem explicações adicionais. O sistema implementa validação para filtrar termos inválidos (como "crítico" ou "literatura crítica") que não devem ser utilizados em buscas.

Para consultas genéricas (ex: "recomendar um livro"), o sistema utiliza exclusivamente os interesses coletados durante o onboarding, combinando-os com operadores lógicos OR na consulta à API do Google Books.

#### 2.1.6 Inferência de Contexto para Consultas Ambíguas

Quando uma mensagem contém a palavra "livros" mas o contexto é ambíguo (ex: "livros dragon ball z"), o sistema utiliza a API Groq para inferir o tema principal da consulta. Se um tema válido é identificado, o sistema retorna uma mensagem de confirmação ao usuário ("Você gostaria de livros sobre [tema]?") com botões de resposta "Sim" e "Não". Se o usuário confirma, a busca é realizada normalmente; caso contrário, a interface retorna ao estado inicial.

#### 2.1.7 Geração de Explicações Personalizadas

Para cada livro retornado em uma busca, o sistema gera uma explicação personalizada utilizando a função `generateRecommendationReason()`. Esta função:

1. Verifica se o livro corresponde aos interesses do usuário (comparando gênero do livro com interesses do onboarding);
2. Constrói um prompt contextualizado para a API Groq que inclui informações do livro (título, autor, gênero, sinopse) e interesses do usuário;
3. Solicita ao modelo uma frase curta (máximo 2 linhas) explicando por que o livro foi recomendado;
4. Implementa fallback para casos em que a API não está disponível, retornando uma mensagem genérica baseada nos interesses.

#### 2.1.8 Filtragem de Resultados

O sistema implementa filtragem para evitar duplicação de recomendações:

- Livros já presentes nas recomendações do usuário são excluídos;
- Livros já incluídos em planos de leitura ativos são excluídos;
- Apenas livros com informações completas (título, autor, imagem) são retornados.

#### 2.1.9 Geração de Planos de Leitura

O sistema oferece funcionalidade de geração automática de planos de leitura personalizados utilizando a API Groq. Com base no número de páginas do livro e no tempo disponível do usuário, o modelo gera um plano estruturado em JSON contendo etapas diárias de leitura, datas de início e término, e páginas a serem lidas por dia.

#### 2.1.10 Sistema de Favoritos e Recomendações

O sistema mantém listas separadas de favoritos e recomendações, permitindo que o usuário gerencie seus livros de interesse. Quando um livro é removido das recomendações, o sistema verifica se ele também está nos favoritos e o remove automaticamente para manter consistência dos dados.

### 2.2 ANÁLISE

#### 2.2.1 Análise da Detecção de Intenção

O sistema de detecção de intenção baseado em palavras-chave demonstrou eficácia na identificação de consultas de busca de livros. A inclusão de padrões em português e espanhol permite maior flexibilidade na interação do usuário. Padrões específicos como `^recomendar\s+um\s+livro(s)?\.?$/i` foram implementados para identificar corretamente consultas genéricas em português.

#### 2.2.2 Análise da Extração de Termos com IA

A utilização do modelo Llama 3.1 para extração de termos demonstrou capacidade de interpretar consultas complexas e extrair termos relevantes. No entanto, foi necessário implementar validação adicional para filtrar termos inválidos que ocasionalmente eram retornados pelo modelo. A estratégia de fallback para método simples de extração garante que o sistema continue funcionando mesmo quando a API de IA não está disponível.

#### 2.2.3 Análise da Inferência de Contexto

O mecanismo de inferência de contexto para consultas ambíguas melhorou significativamente a experiência do usuário, permitindo que o sistema interprete intenções não explícitas e solicite confirmação antes de realizar buscas. Isso reduz buscas incorretas e aumenta a satisfação do usuário.

#### 2.2.4 Análise da Geração de Explicações

A geração automática de explicações personalizadas utilizando IA produziu resultados mais contextualizados e envolventes do que mensagens genéricas. As explicações relacionam características específicas dos livros com os interesses do usuário, aumentando a probabilidade de aceitação das recomendações.

#### 2.2.5 Análise da Integração com Google Books API

A integração com a API do Google Books forneceu acesso a um vasto catálogo de livros com metadados completos. A implementação de paginação e carregamento sob demanda permitiu otimizar o desempenho da aplicação.

### 2.3 DISCUSSÃO DE RESULTADOS

#### 2.3.1 Eficácia da Personalização

O sistema de personalização baseado em onboarding demonstrou eficácia na filtragem de recomendações. Livros retornados em buscas genéricas são consistentemente alinhados com os interesses do usuário, enquanto buscas específicas respeitam a intenção explícita do usuário.

#### 2.3.2 Impacto da IA na Experiência do Usuário

A integração de LLMs (Groq/Llama 3.1) trouxe melhorias significativas em três aspectos principais:

1. **Compreensão de linguagem natural**: O sistema consegue interpretar consultas em linguagem natural sem necessidade de sintaxe específica;
2. **Inferência de contexto**: Consultas ambíguas são interpretadas e confirmadas, reduzindo erros de busca;
3. **Geração de conteúdo**: Explicações personalizadas aumentam o engajamento e a confiança do usuário nas recomendações.

#### 2.3.3 Limitações Identificadas

Algumas limitações foram identificadas durante o desenvolvimento:

- **Dependência de APIs externas**: O sistema depende da disponibilidade da API Groq e Google Books. Fallbacks foram implementados, mas a qualidade das recomendações pode ser reduzida quando as APIs não estão disponíveis;
- **Processamento de linguagem**: Embora o modelo Llama 3.1 seja eficaz, consultas muito complexas ou ambíguas podem ainda gerar interpretações incorretas;
- **Armazenamento local**: O uso de localStorage limita a persistência de dados a um único dispositivo/navegador.

#### 2.3.4 Contribuições do Trabalho

Este trabalho contribui para a área de sistemas de recomendação ao demonstrar:

- A viabilidade de integração de LLMs em sistemas de recomendação de livros;
- A importância da inferência de contexto para melhorar a precisão de buscas;
- O valor da geração automática de explicações personalizadas para aumentar o engajamento do usuário;
- Uma arquitetura prática e escalável para sistemas de recomendação baseados em IA.

---

## 3. CONSIDERAÇÕES FINAIS

O sistema de recomendação de livros desenvolvido demonstrou a viabilidade e os benefícios da integração de modelos de linguagem de grande escala em sistemas de recomendação. A utilização da API Groq (Llama 3.1) para processamento de linguagem natural, extração de termos, inferência de contexto e geração de explicações personalizadas resultou em uma experiência de usuário mais natural e engajadora.

Os resultados indicam que a personalização baseada em onboarding, combinada com processamento inteligente de consultas, melhora significativamente a relevância das recomendações. O mecanismo de inferência de contexto para consultas ambíguas reduz buscas incorretas e aumenta a satisfação do usuário.

Como trabalhos futuros, sugere-se:

1. Implementação de backend com banco de dados para persistência de dados entre dispositivos;
2. Integração de técnicas de aprendizado de máquina para melhorar recomendações baseadas em histórico de leitura;
3. Implementação de sistema de avaliação de recomendações para coletar feedback do usuário e melhorar o modelo;
4. Expansão do sistema para suportar múltiplos idiomas além de português e espanhol;
5. Desenvolvimento de métricas de avaliação quantitativas para medir a eficácia das recomendações.

---

## REFERÊNCIAS

ASSOCIATION FOR COMPUTING MACHINERY. **ACM Digital Library**. Disponível em: https://dl.acm.org/. Acesso em: [data de acesso].

GOOGLE. **Google Books API**. Disponível em: https://developers.google.com/books. Acesso em: [data de acesso].

GROQ. **Groq API Documentation**. Disponível em: https://console.groq.com/docs. Acesso em: [data de acesso].

META. **Llama 3.1 Model Card**. Disponível em: https://ai.meta.com/llama/. Acesso em: [data de acesso].

NEXT.JS. **Next.js Documentation**. Disponível em: https://nextjs.org/docs. Acesso em: [data de acesso].

REACT. **React Documentation**. Disponível em: https://react.dev/. Acesso em: [data de acesso].

RICCI, F.; ROKACH, L.; SHAPIRA, B. **Recommender Systems Handbook**. 2. ed. New York: Springer, 2015.

RUSSELL, S.; NORVIG, P. **Inteligência Artificial: Uma Abordagem Moderna**. 3. ed. Rio de Janeiro: Elsevier, 2013.

---

**Nota:** Este esqueleto segue as normas da ABNT (NBR 6022, NBR 6023, NBR 6024, NBR 6028, NBR 10520). As referências devem ser completadas com datas de acesso reais e outras referências relevantes da literatura acadêmica sobre sistemas de recomendação, processamento de linguagem natural e inteligência artificial.


