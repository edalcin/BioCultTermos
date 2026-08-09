/**
 * Preset Tailwind da Arquitetura BioCultural — fonte única dos tokens visuais.
 *
 * POR QUE AQUI: a identidade visual é exigida como idêntica em todas as unidades
 * federadas (`CLAUDE.md` de cada unidade; `constitution.md` §III), mas até aqui era
 * garantida por nada — a paleta `forest` estava copiada em dois `tailwind.config.js`
 * e já havia divergido (BioCultDB 50–900, BioCultTermos 50–950). Com cinco unidades
 * a cópia vira bifurcação, que é o problema que o ADR-012 resolveu para o código.
 *
 * Este arquivo vive dentro do Módulo Compartilhado porque as quatro Unidades
 * Hospedeiras já o carregam como submodule: os tokens propagam pelo mesmo mecanismo
 * do ADR-012, com Atraso de Módulo medido, sem repositório novo nem registry.
 *
 * ponytail: o módulo de vocabulário hospedando os tokens de design é um desvio de
 * responsabilidade assumido — o preço de não criar um segundo módulo compartilhado
 * para ~40 linhas. Se a identidade visual crescer para além de tokens (componentes
 * versionados, ícones, tipografia própria), extraia para um módulo próprio e
 * consuma-o do mesmo jeito.
 *
 * USO, no `tailwind.config.js` de cada unidade:
 *
 *   module.exports = {
 *     presets: [require('./bioculttermos/tailwind.preset.cjs')],
 *     content: [ ...caminhos da unidade... ],
 *   };
 *
 * `.cjs` deliberado: o config do BioCultDB é CommonJS e o do BioCultTermos é ESM.
 * CommonJS é o único formato que os dois carregam sem ginástica.
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        // Tema etnobotânico da arquitetura. 950 incluído — o BioCultTermos já o
        // usava; o BioCultDB não o referencia, então acrescentá-lo não muda nada
        // do que está em produção.
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a', // primária
          700: '#15803d', // hover / header
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
      },
    },
  },
  plugins: [],
};
