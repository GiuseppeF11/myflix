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
            </div>
            <div>
                <div>
                    <strong>Voto: </strong>
                    <i class="fa-star text-warning" v-for="(star, i) in 5" :class="(Math.ceil(voteAverage/2)) <= i ? 'fa-regular' : 'fa-solid'"></i> <!-- Se il voto è minore o uguale a 5 stampa la stella piena, altrimenti stella vuota-->
                </div>
                <div class="row">
                    <section class="col">
                        <strong>Lingua: </strong>
                        <img class="flag" :src="getFlag()" :alt="originalLanguage">
                    </section>
                    <section class="col d-flex justify-content-end">
                        <i class="fa-solid fa-circle-info fs-4 info" @click="toggleModal"></i>
                    </section>
                </div>
            </div>
        </div>
        <div v-if="showModal" class="modal-overlay" @click="toggleModal">
            <div class="modal-content" @click.stop>
                <span class="close-button" @click="toggleModal">&times;</span>
                <p>{{ overview }}</p>
            </div>
        </div>
    </section>
</template>

<style lang="scss" scoped>
.flag {
    width: 30px;
}

.card {
  box-shadow: 0px 0px 20px rgb(0, 0, 0);
  border-radius: 5px;
  position: relative; 
  overflow: hidden;
  scale: 0.9;
  transition: transform linear 0.3s;
  &:hover {
    transform: scale(1.1);
    .card-image {
      filter: brightness(20%); 
    }
    .card-details {
      display: block;
    }
  }
  .card-image {
    height: 350px;
    transition: linear 0.1s;
    cursor: pointer;
    position: relative; 
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .card-details {
    position: absolute;
    display: none;
    transition: linear 0.3s;
    color: whitesmoke;
    padding: 10px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7); 
    z-index: 10;
    flex-direction: column;
    justify-content: space-between;

    &:hover{
        display: flex;
    }

    h4 {
      margin-bottom: 20px;
      min-height: 80px;
    }
    p {
      height: 100px;
      overflow: auto;
    }
  }
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
