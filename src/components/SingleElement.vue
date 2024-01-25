<script>
export default {
    data() {
        return {

        };
    },
    methods: {
        getFlag() {
            let finalLink = 'https://flagicons.lipis.dev/flags/4x3/';
            if (this.originalLanguage == 'en') {
                finalLink += 'gb';
            }
            else if (this.originalLanguage == 'js') {
                finalLink += 'jp';
            }
            else {
                finalLink += this.originalLanguage;
            }

            finalLink += '.svg';
            return finalLink;
        }

    },
    props: {
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
            <img :src="poster" :alt="titleOrName" class="poster" v-if="poster != null">
            <img src="https://image.pngaaa.com/321/3555321-small.png" :alt="titleOrName" class="poster" v-else>
        </div>
        <div class="details-box">
            <div>
                <strong>Title: </strong> {{ titleOrName }}
            </div>
            <div>
                <strong>Original title: </strong>{{ originalTitleorName }}
            </div>
            <div>
                <strong>Original language: </strong> {{ originalLanguage }} 
                <img class="flag" :src="getFlag()" :alt="originalLanguage">
            </div>
            <div>
                <strong>Vote: </strong> {{ (parseInt(voteAverage/2))}}
                <i class="fa-star" v-for="(star, i) in 5" :class="(parseInt(voteAverage/2)) <= i ? 'fa-regular' : 'fa-solid'"></i>
            </div>
            <div>
                Flag:
                
            </div>
            <div>
                Overview: {{ overview }}
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.flag {
    width: 30px;
}

.fa-star {
    color: gold;
}

.element {
    background-color: black;
    position: relative;
    height: 300px;
    width: 200px;
    box-shadow: 10px 10px 20px rgb(0, 0, 0);

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
    }
}


</style>
