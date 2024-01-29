<script>
export default {
    data() {
        return {

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
    <div class="element">
        <div class="poster-box">
            <img :src="poster" :alt="titleOrName" class="poster" v-if="poster != null">         <!-- Se il link è valido allora stampalo -->
            <img src="https://image.pngaaa.com/321/3555321-small.png" :alt="titleOrName" class="poster" v-else>  <!-- Altrimenti stampa quest'immagine -->
        </div>
        <div class="details-box">
            <div class="detail">
                <strong>Title: </strong> {{ titleOrName }}
            </div>
            <div class="detail">
                <strong>Original title: </strong>{{ originalTitleorName }}
            </div>
            <div class="detail">
                <strong>Original language: </strong> {{ originalLanguage }} 
                <img class="flag" :src="getFlag()" :alt="originalLanguage"> <!-- Richiama la funzione per prendere le bandiere dinamicamente -->
            </div>
            <div class="detail">
                <strong>Vote: </strong> {{Math.ceil(voteAverage/2)}}
                <i class="fa-star" v-for="(star, i) in 5" :class="(Math.ceil(voteAverage/2)) <= i ? 'fa-regular' : 'fa-solid'"></i> <!-- Se il voto è minore o uguale a 5 stampa la stella piena, altrimenti stella vuota-->
            </div>
            <div class="detail">
                <strong>Overview: </strong> {{ overview }}
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.flag {
    width: 30px;
}

.fa-star {
    color: rgb(182, 182, 182);
}

.element {
    background-color: black;
    position: relative;
    height: 300px;
    width: 200px;
    box-shadow: 0px 0px 50px rgb(0, 0, 0);
    transition: 0.5s;

    &:hover {
            cursor: pointer;
            box-shadow: 0px 0px 30px rgb(255, 255, 255);
            transition: 0.5s;
            .details-box {
                display: block;
                transition: 0.5s;
            }
            .poster-box {
                opacity: calc(0.1);
                transition: 0.5s;
            }
        }
    .poster-box {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
        
        .poster {
            width: 100%;
            object-fit: contain;
        }
    }

    .details-box {
        height: 100%;
        display: none;
        padding: 10px;
        position: absolute;
        bottom: 0;
        overflow: auto;
        text-align: center;
        .detail {
            margin-bottom: 10px;
        }
    }
}


</style>
