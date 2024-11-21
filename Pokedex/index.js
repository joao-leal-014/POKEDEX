const { createApp } = Vue;

createApp({
    data() {
        return {
            pokemons: [],
            loading: true,
            textoBusca: '',
            proximaPagina: 1,
            pokemonSelecionado: null
        }
    },
    computed: {
        pokemonsFiltrados() {
            if (this.textoBusca === '') {
                return this.pokemons;
            }
            return this.pokemons.filter(pokemon => pokemon.name.toLowerCase().includes(this.textoBusca.toLowerCase()));
        }
    },
    created() {
        this.chamarAPI();
        window.addEventListener('scroll', this.tratarScroll);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.tratarScroll);
    },
    methods: {
        async chamarAPI() {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${(this.proximaPagina - 1) * 50}&limit=${50}`);
                const data = await response.json();
                const promessasDetalhesPokemon = data.results.map(async pokemon => this.obterDadosPokemon(pokemon.url));
                const detalhesPokemons = await Promise.all(promessasDetalhesPokemon);
                this.pokemons = [...this.pokemons, ...detalhesPokemons];
                this.proximaPagina++;
                this.loading = false;
            } catch (error) {
                console.error(error);
            }
        },
        async obterDadosPokemon(url) {
            try {
                const response = await fetch(url);
                const data = await response.json();
                return {
                    id: data.id,
                    name: data.name,
                    weight: data.weight,
                    height: data.height,
                    abilities: data.abilities,
                    base_experience: data.base_experience,
                    types: data.types,
                    sprites: data.sprites,
                };
            } catch (e) {
                console.error(e);
            }
        },
        tratarScroll() {
            const fimDaPagina = document.documentElement.scrollTop + window.innerHeight >= document.documentElement.offsetHeight;
            if (fimDaPagina && !this.loading) {
                this.loading = true;
                this.chamarAPI();
            }
        },
        obterClasseTipo(pokemon) {
            if (pokemon.types.length === 2) {
                return {
                    background: `linear-gradient(to right, ${this.corTipo(pokemon.types[0].type.name)} 50%, ${this.corTipo(pokemon.types[1].type.name)} 50%)`,
                    color: 'white'
                };
            } else {
                return {
                    backgroundColor: this.corTipo(pokemon.types[0].type.name),
                    color: 'white'
                };
            }
        },
        corTipo(tipo) {
            const cores = {
                fire: '#c27e10',
                grass: '#4CAF50',
                dragon: '#3263cc',
                ice: '#42bed3',
                fighting: '#ba082a',
                ground: '#9e7e52',
                bug: '#98e880',
                normal: '#A9A9A9',
                poison: '#9e5cda',
                electric: '#ffd365',
                rock: '#897975',
                steel: '#999999',
                psychic: '#e39fa4',
                fairy: '#f040f3',
                dark: '#12124f',
                water: '#00BFFF',
                flying: '#23f1c7',
                ghost: '#5626de'
            };
            return cores[tipo] || '#A9A9A9';
        },
        async buscarPokemon() {
            if (this.textoBusca === '') {
                this.pokemons = [];
                this.proximaPagina = 1;
                this.loading = true;
                await this.chamarAPI();
                return;
            }
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
                const data = await response.json();
                const promessasDetalhesPokemon = data.results.map(async pokemon => this.obterDadosPokemon(pokemon.url));
                const detalhesPokemons = await Promise.all(promessasDetalhesPokemon);
                this.pokemons = detalhesPokemons.filter(pokemon => pokemon.name.toLowerCase().includes(this.textoBusca.toLowerCase()));
            } catch (error) {
                console.log(error);
            }
        },
        selecionarPokemon(pokemon) {
            this.pokemonSelecionado = pokemon;
        },
        voltarLista() {
            this.pokemonSelecionado = null;
        }
    }
}).mount("#app");
