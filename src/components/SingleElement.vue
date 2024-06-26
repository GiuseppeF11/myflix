<script>
export default {
    data() {
        return {
            showModal: false,
        };
    },
    methods: {
        getFlag() {
            let finalLink = 'https://flagicons.lipis.dev/flags/4x3/'; //Assegnamo il link base delle bandiere
            if (this.originalLanguage == 'en') {        //Se La lingua è en la cambiamo in gb
                finalLink += 'gb';
            }
            else if (this.originalLanguage == 'js') {
                finalLink += 'jp';
            }
            else if (this.originalLanguage == 'ja') { 
                finalLink += 'jp';
            }
            else if (this.originalLanguage == 'ko') { 
                finalLink += 'kr';
            }
            else if (this.originalLanguage == 'da') { 
                finalLink += 'dk';
            }
            else if (this.originalLanguage == 'cs') { 
                finalLink += 'cz';
            }
            else if (this.originalLanguage == 'zh') { 
                finalLink += 'cn';
            }
            else if (this.originalLanguage == 'fa') { 
                finalLink += 'ir';
            }
            else if (this.originalLanguage == 'nb') { 
                finalLink += 'no';
            }
            else if (this.originalLanguage == 'hi') { 
                finalLink += 'io';
            }
            else if (this.originalLanguage == 'he') { 
                finalLink += 'il';
            }
            else {
                finalLink += this.originalLanguage;
            }

            finalLink += '.svg';
            return finalLink;
        },
        toggleModal() {
            this.showModal = !this.showModal;
        }
    },
    props: {                        //Definisco le props provenienti dall'AppMain
        titleOrName: String,
        originalTitleorName: String,
        originalLanguage: String,
        voteAverage: Number,
        poster: String,
        overview: String,
    }
}
</script>

<template>
    <section class="card">
        <div class="card-image">
            <img :src="poster" :alt="titleOrName" class="poster" v-if="poster != null">
            <img src="https://image.pngaaa.com/321/3555321-small.png" :alt="titleOrName" class="poster" v-else>
        </div>
        <div class="card-details">
            <div>
                <h4>{{ titleOrName }}</h4>
                <p>{{ overview }}</p>                    
            </div>
            <div>
                <div>
                    <strong>Voto: </strong>
                    <i class="fa-star text-warning" v-for="(star, i) in 5" :class="(Math.ceil(voteAverage/2)) <= i ? 'fa-regular' : 'fa-solid'"></i> <!-- Se il voto è minore o uguale a 5 stampa la stella piena, altrimenti stella vuota-->
                </div>
                <div class="row">
                    <section class="col">
                        <strong>Lingua: </strong>
                        <img class="flag" :src="getFlag()" :alt="originalLanguage"> <!-- Richiama la funzione per prendere le bandiere dinamicamente -->
                    </section>
                </div>
            </div>
        </div>
    </section>
</template>

<style lang="scss" scoped>
.flag {
    width: 30px;
    border-radius: 50%;
}

.info {
    color: grey;
    transition: 0.3s linear;
    cursor: pointer;
    &:hover {
        color: white;
    }
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: #ffffff;
    overflow: auto;
    height: 100%;
    padding: 10px;
    border-radius: 5px;
    width: 100%;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0);
    position: relative;
}

.close-button {
    position: fixed;
    top: 5px;
    right: 10px;
    font-size: 30px;
    font-weight: 900;
    cursor: pointer;
}
</style>
