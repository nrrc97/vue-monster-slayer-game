function getRandomInteger(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const {createApp, ref, computed, watch, onMounted, onUnmounted} = Vue;
const app = createApp({
    setup(){
        // Función de delay para pausas
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Tamaño del mapa mundial (en tiles)
        const MAP_WIDTH = 120;
        const MAP_HEIGHT = 120;
        const TILE_SIZE = 16;
        const ZOOM_LEVEL = ref(2);

        // Tamaño de la vista (en pixeles)
        const VIEWPORT_WIDTH = 610;
        const VIEWPORT_HEIGHT = 420;

        // Zonas del mapa
        const zoneMap = [
            [3, 3, 2, 2, 3, 5, 4, 5],
            [3, 2, 1, 2, 3, 3, 4, 5],
            [4, 1, 0, 0, 1, 3, 4, 5],
            [5, 1, 1, 12, 9, 6, 6, 6],
            [5, 5, 4, 12, 12, 7, 7, 7],
            [10, 9, 8, 12, 12, 12, 8, 7],
            [10, 10, 11, 12, 13, 13, 9, 8],
            [11, 11, 12, 13, 13, 12, 9, 9],
        ];

        // Diseño del mapa
        // 'W': Agua, 'G': Pradera, 'M': Montaña impasable, 'S': Escaleras, 'T': Pueblo,
        // 'C': Castillo, 't': Pueblo desolado, 'B': Puente, 'D': Calabozo, 'm': montaña,
        // 'F': Bosque
        const mapLayout = [
        //    |              |              |              |              |              |              |              |              |
        /*0-|--------------|--------------|--------------|--------------|--------------|--------------|--------------|--------------|------*/
            "WWGGGGGGWWWWWWWWWWWWGGGGGGGWWWWWWWWWWWWWWWGGGGGGGGWWWWWWWWWWWWWWWWWWWWWWWWWFFFFFGGGWWWWWWWWWWWWWWGGGGGGGGGGGWWWWWWWWWWWW",
            "WGGGFFFFGGWWWWWWWWGGGGGGGGGGGWWWWWWWWWWWGGGGGGmmmmmmmmWWWWWWWWWWWWWWWWWWFFFFFFFFGSGWWWWWWWWWMMMMMMMmmmmmGGGGGGGWWWWWWWWW",
            "GGTFFFFFFGGWWWWWGGGGGGFFFFFGGGWWWWWWWWWGGGGGGFFFFFmmmmmmWWWWWWWWWWWWWWFFFFFFFFFGGGWWWWWWWWWMMMMmmmmmmmmmmGGGGGGGWWWWWWWW",
            "GFFFFFFFFFGGGGGGGGGGGFFFFFFFFGGWWWWWWWWGGGGGFFFFFFFFFmmmmWWWWWWWWWWWWFFFFFFFFFFMMWWWWWWWWWMMMmmmmmmmmmmmmmGGGGGGGGGWWWWW",
            "FFFFFFmmmmmMMMGGGGGGFFFFFFFFFFGGWWWWWWGGGGGFFFFFFFFFFmmmmmWWWWWWWWWWWFFFFFFFFFMMMWWWWWWWMMMmmmmmmmmmFFFFFFFFGGGGGGGGWWWW",
            "FFFFFmmmmmMMMMMGGGGGFFFFFFFFFFGGGGWWGGGGGFFFFFWWWFFFFFmmmmWWWWWWWWWWFFFFFFFFFMMMWWWWWWWMMMmmmmmmmmFFFFFFFFFFFFGGGGGGGWWW",
            "FFFmmmmmMMMMMMMMGGGFFFFFFFFFFFFFGGGGGGGGGFFFFWWWWWFFFmmmmWWWWWWWWWMMMFFFFFFFMMMWWWWWWWmmmmmmmmmmmFFFFFFFFFFFFFFGGGGGGWWW",
            "mmmmmmMMMMMFFFFMMMMFFFFFFFFFFFFGGGGGGGGGFFFFFFWWWmmmmmmmWWWWWWWWWMMMFFFFFFFFFMMMWWWWWWWmmmmmmmmmFFFFFFMMMMMFFFFFFGGGGGWW",
            "mmmmMMMMFFFFFFFFFMMMFFFFFFFFFFFFFGGGGGGFFFFFFWWWmmmmmmmmWWWWWWWWWWMMMFFFFFFFFFMMMWWWWWmmmmmmmmFFFFFFMMMFFFMMMFFFFFFGGGWW",
            "mmmmMMFFFFFFFFFFFFMMFFFFFFssssFFFFFGGGGGFFFFFFFmmmmmmmmWWWWWWWWWFFFMMMFFFFFFFFFFMMWWWWmmmmmmmmFFFFFMMFFFFFFMMFFFFFFFGGGW",
            "mmGGGFFFFFFFFFFFFMMMFFFFFssssssFFFFFFGGGGGFFFFFFmmmmmmWWWWWWWWWFFFMMMMFFFFFFFFFFFMMWWWWmmmmmmmFFFFFFFFFFTFFFMMFFFFFFFFWW",
            "WWGGGGFFFFFFFFFFFFMMMFFFssssssssFFFFFFGGGGGFFFFFFFmmmWWWWWWWWWWFFFFMMMMFFFFFFFFFFFMWWWWWmmmmmmmFFFFFFFFFFFFFFFFFFFFFFFFW",
            "WWWGGGGGFFFFFFFFFFMMMMFFssssDsssFFFFFGGGGGGFFFFFFFmmmmmWWWWWWWFFFFFMMMMFFFFFFFFFFFMWWWWWmmmmmmmmFFFFFFFFFFFFFFFFFFFFFFFF",
            "WWWWGGGGGGGGFFFFFFFMMMMFFsssssssFFFFFFGGGGGGFFFFFFFmmmmmWWWWWFFFFFFFMMMMMMFFFFFFFFMMWWWWmmmmmmmmmmFFFFFFFFFFFFFFFFFFFFFF",
            "WWWWWFFFFGGGGGFFFFFFMMMMFFFssssFFFFFFFFGGGGFFFFFFFFmmmmGGWWWFFFFFFFFFMMMMMMFFFFFFFMMMWWWWmmmmmmmGGGGFFFFFFFFFFFFFFFFFFFF",
        /*1-|--------------|--------------|--------------|--------------|--------------|--------------|--------------|--------------|------*/
            "WWWWFFFFFGGGGGGFFFFFFFMMMFFFFFFFFFFFFFGGGGGGFFFFFFFFmmGGGWWFFFFFFFGGGGGGGMMMFFFFFFFMMMWWWWmmmmmGGGGGGFFFFFFFFFFFFFFFFWWW",
            "WWWWWWFFGGGGGGGFFFFFFGGGGFFFFFFFFFFFFFGGGGGFFFFFFFFFFGGGGWWFFFFGGGGGGGGGGGGMMMMFFFFFMMMWWWWWFFGGGGGGGFFFFFFFFFFFFWWWWWWW",
            "WWWFFFFFFGGGGGGGFFFFGGGGGFFFFFFFFFFFFGGGGGFFFFFFFFFFGGGGGGWWGGGGGGGGGGGGGGGGGMMMFFFFFMMMWWFFFGGGGGGGFFFFFFFFMMMMWWWWWWWW",
            "WWFFFFFFFFGGGGGGGGGGGGGGFFFFFFFFFFFFFGGGGGGFFFFFFFFGGGGGGGGWWGGGGGGGGGGGGGGGGGMMMMFFFFWWWFFFFGGGGGGGFFFFMMMMMMFFFFWWWWWW",
            "WWFFFFFFFFGGGGGGGGGGGGGGFFFFFFFFFFFFFFGGGGGGFFFFFFGGGGGGGGGGBGGGGGGFFFFFFGGGGGGMMMMFFFFFFFFFGGGGGGGFFMMMMMMMFFFssssWWWWW",
            "WFFFFFFFFFFFGGGGGGGGGGGGGGFFFFFFFFFFFFGGGGGGGFFFGGGGGGGGGGGGWWGGGGFFFFFFFFGGGGGGMMMMMMMMMMFFWGGGGGFFMMMMMFFFFFsssssssWWW",
            "FFFFFFFFFFFFGGGGGGGGGGGGGGGFFFFFFFFFFGGGGGGGGGGGGGGGGGGGGGGGGWGGGFFFFFFFFFFGGGGGFFMMMMMMMMMWWGGGGGFMMMMMMsssssssssssssWW",
            "FFFFFFFFFFFFFGGGGGGGGGGGGmmmmFFFFFFFGGGGGGGGGGGGGGGGGGGGGGGGGWGGFFFFFmmmmFFFGGGFFFFFFFmmmWWWWWGGGGGMMMMMssssssssssssssss",
            "FFFFFFFFFFFFFFGGGGGGGWWWmmmmmmmFFFFGGGGGGGGGGGGGGGFFFFGGGGGGGWWFFFFmmmmmmFFFFGGGFFFFFmmmmmWWWWGGGGGGMMMssssssssssFFsssss",
            "FFFFFFFFFFFFFFFGGGGWWWWWWWmmmmmmFFFFGGGGGGGGGGFFFFFFFFFGGGGGGGWWFFFmmmmmmmFFFFGGGGFFmmmmmmmWWWWGGGGGGGGsssssssssFFFFssss",
            "FFFFFFFFFFFFFFFFGGWWWWWWWWWmmmmmFFFFGGGGGGGGFFFFFFFFFFmmmGGGGGGWWFFFmmmmmmmFFFFGGGGGGmmmmmmmWWWWGGGGGGGsssssssssFFFFssss",
            "FFFFFFFFFFFFFFFFFWWWWWWWWWWmmmmFFFFGGGGGGGGFFFFFFFFFFmmmmmmGGGGGWWFFFmmmmmFFFFFFGGGGGGFFFFFFFWWWGGGGGGGssssssssssFFsssss",
            "WWFFFFFFFFFFFFFFFWWWWWWWWWMMMFFFFFFGGGGGGGFFFFFFFFFFmmmmmmmmGGGGGWWWWWFFFFFFFFFFGGGGGFFFFFFFWWWWWGGGGGGGsssssssssssssssW",
            "WWWFFFFFFFFFFFFFWWWWWWWWWMMMMMMMGGGGGGGGFFFFFFFFFFFFmmmmmmmmmGGGGGGGWWWWWFFFFFFFFGGGGGFFFFFWWWWWGGGGGGGGGsssssssssssssWW",
            "WWWWWWWWFFFFFFFWWWWWWMMMMMMMMMMMMGGGGGGGFFFFFFFFFFFFFmmmmmmmmGGGGMMMMWWWWWFFFFFFFGGGGGGFFFWWWWWGGGGGGGGGGGsssssssssssWWW",
        /*2-|--------------|--------------|--------------|--------------|--------------|--------------|--------------|--------------|------*/
            "WWWWmmmWWWFFFFWWWWWMMMMMMMMMMMMMMMGGGGGFFFFFFFFFMMMMMMmmmmmmGGGMMMMMWWWWWWWFFFFFFFGGGGGGWWWWWWGGGGGGGGGGGGGGsssssssWWWWW",
            "WWWmmmmmmBFFWWWMMMMMMMMMMMMMMMMMGGGGGGFFFFFFFMMMMMMMMMMmmmmmmMMMMMMWWWWWWWWWFFFFFFGGGGGGGWWWWWWGGGGGGGGGGGGGmmmmmmWWWWWW",
            "WWmmmmmmmWWWWWmmmMMMMMMMMMMMMMGGGGGGGGGFFFMMMMMMMMMMMMMMmmmmmMMMMMMMWWWWWWWFFFFFFGGGGGGGGWWWWWWWGGGGGGGGGGmmmmmmmmmmWWWW",
            "WWmmmmmmmmmmmmmmmmmmmMMMMMMMGGGGGGGGGGGGMMMMMMMmmmmMMMMMMFFFMMMMMMMMMWWWWWFFFFFFFFGGGGGGGGWWWWWGGGGGGGGGGmmmmmmmmFFFFWWW",
            "WWmmmmmmmmmmmmmmmmmmmmmMMMMGGGGGGGGGGGGMMMMmmmmmmmmmmmMMFFFFFFFFFFMMMMWWWFFFFFFFFFFGGGGGGGGWWWGGGGGGGGGGmmmmmmmFFFFFFFWW",
            "WWWmmmmmmmmmmGGGGmmmmmmmMMGGGGGGGGGGGGGGmmmmmmmmmmmmmmmMMFFFFFsssssMMMMMMMFFFFFFFFGGGGGGGGGWWGGGGGGGGGGmmmmmmmFFFFFFFFFW",
            "WWWWmmmFFFFGGGGGGGGmmmmmWWGGGGGGGGGGGGGFFFFFFFmmmmmmmmMMMMFFsssssssssMMMMMMFFFFFFGGGGGGGGGWWGGGGGMMMMmmmmmmmmFFFFFFFFFFF",
            "WWFFFFFFFFGGGGGGGGGGmmmWWWWGGGGGGGGGGGFFFFFFFFFFFmmmmmmMMMMsssssssssPPPFFFFFFFFFGGGGGGGGGGBGGGFFMMMMMMmmmmmmFFFFFFFFFFFW",
            "WFFFFFFFGGGGGGGGGGGmmmmWWWWWGGGGGGGGFFFFFFFFFFFFFFmmmmmmmmWWWWsssssPPPPPFFFFFFFFFGGGGGGWWWWFFFFFMMMMMMMmmmmFFFFFFFFFFFFW",
            "FFFFFFFGGGGGGGGGGFFFFFWWWWWGGGGGGGGFFFFFFFFFFFFFFGGGGmmmmWWWWWWWWPPPPPPPPFFFFFFFGGGGWWWWWWWWFFFFFFFMMMMMmmFFFFFFFFFFFFWW",
            "FFFFFGGGGGGGGGFFFFFFFWWWWWWGGGGGGGGGFFFFFFFFFFGGGGGGGGGWWWWWWWWWPPPPPPPPFFFFFFFWWWWWWWWWWWWWFFFFPPPPMMMMFFFFFFFFFFFFFWWW",
            "FFFFGGGGGGGFFFFFFFFWWWWWWWWWGGGGGGGGGFFFFFFFGGGGTGGGGGWWWWWWWWWWWWPPPPPFFFFFFWWWWWWWWWWWWWWWWWPPPPPPPPMMMMMFFFFFFWWWWWWW",
            "FFFFFGGGGGFFFFFWWWWWWWWWWGGGGGGGGGGGGGGGGGGGGGGGGWWWWWWWWWWWWWWWWWWWWFFFFFWWWWWWWWWWWWWWWWWWWWWWWPPPPPPMMMMMMMWWWWWWWWWW",
            "WFFFFFGGGFFFFWWWWWWWWWWWGGGGGGGGGGGGGGGGGGGCGGGWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWPPPPPPPMMMWWWWWWWWWWW",
            "WWFFFFFFFFFFWWWWWWWWWGGGGGGGGGGGGGGGGGGGGGGGGWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWPDPMMWWWWWWWWWWWW",
        /*3-|--------------|--------------|--------------|--------------|--------------|--------------|--------------|--------------|------*/
            "WWFFFFFFFFFWWWWWWWWWFFFFFFGGGGGGGGGGGGGGGGGWWWWWWWWMMMWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWFFFFFFWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
            "WWWWFFFFFFFFFWWWWWWFFFFFFFFGGGGGGGGGGGGGGWWWWWWWWMMMMMMWWWWWWWWWWWWWWWWWWWWWWWFFFFFFFFFFFFGGGGGWWWWWWWWWWWWWWWWWWWWmmmmW",
            "WWWFFFFFFFFFFFWWWWWWWWFFFFFFFGGGGGGGGGGGWWWWWWWPPPMMMMMMMWWWWWWWWWWWWWWWWWFFFFFFFFFFFFFFFGGGGGGGGGWWWWWWWWWWWWWWWWmmmmmm",
            "WWFFFFFFFFFFFFFWWWWWWWWFFFFFFFFGGGGGGGGWWWWWWWMPCPMMMMMMMMWWWWWWWWWWWWWssssFFFFFFFFFFFFFFGGGGGGGGGGGGWWWWWWWWWWWWmmmmmmm",
            "WWWFFFFFFFFFFFWWWWWWWWWWFFFFFFFFGGGGGGGGWWWWWMMPPPssMMMMMMMWWsssBsssWWsssssssFFFFFFFFFFFFFGGGGGGGGGGGGGPDPWWWWWWmmmmmmmm",
            "WWWFFFFFFFFFFMMMMWWWWWFFFFFFFFFFFGGGGGGGWWWWMMMMMMMssMMMMssssssWWWWsssssssssssFFFFFFFFFFFFFFGGGGGGGGGGGPPPWWWWWFFFFmmmmm",
            "WWWWWFFFFFFMMMMMMMMMMMMMFFFFFFFFGGGGGGGGWWWWWMMMMssssMMMsssssMMWWWWMMssssssssssFFFFFFFFFFFFFFFFFGGGGGGmmmmmmWWFFFFFFFFFF",
            "WWWWGGFFMMMMMMMMMMMMMMMMMFFFFFFFFGGGGGGWWWWWMMMMssssMMMMMsssMMWWWWWWMMMssssssssssFFFFFFFFFFFFFFFMMMmmmmmmmmmmFFFFFFFFFFF",
            "WWGGGGMMMMMMMMMMMMMMMMMMMMFFFFFFFFGGGGWWWWWWWMMssssssMMMMMsMMWWWWWWWWMMMMsssssssssFFFFFFFWWWWMMMMMMmmmmmmmmmFFFFFFFFFFFF",
            "WGGGGMMMMFFFFFFFMMMMMMMMMMMMMFFFFFmmmWWWWWWWWMMMssssssMMMMmmMMWWWWWWWWWMMMssssssssFFFFFWWWWWWWMMMMMMMmmmmmmmmFFFFFFFFFFF",
            "GGGGMMMFFFFFFFFFFMMMMMMMMMMMMMMFFFFmmmWWWWWWWWMMssssssMMMmmMMMWWWWWWWWWWMMMMsssssFFFFWWWWWWWWMMMMMMMMMMMMMmmmFFFFFFFFFFF",
            "GGGGFFFFFFPPPPFFFFFMMMMMMMMMMMMMFFFFmmmWWWWWWWMMsssssMMMmmmMMWWWWWWWWWWWWWMMMmmmmmFFFFWWWWMMMMFFFFFMMMMMMMMFFFFFFFFFFFFW",
            "GGGFFFFFPPPPPPPFFFFFFMMMMGGGGDMMFFFmmmmWWWWWWWMMMsssMMMmmmmMMWWWWWWWWWWWWWMMmmmmmmmmFFFFFFFFFFFFFFFFMMMMMMMMMMFFFFFFFWWW",
            "GGGGFFFPPPPPPPPFFFFFFFGGGGGGMMMmmmmmmmmWWWWWWWWMMssMMMmmmmmmMMWWWWWWWWWWWMMMmmmmmmmmFFFFFFFFFFFFFFFFMMMMMMMMMsssFFFFWWWW",
            "GGGFFFFFPPPPPPFFFFFFFFGGGGGMMMmmmmmmmmWWWWWWWWWMMPMMMMMMmMMMMMWWWWWWWWWWWWMMmmmmmmGGGGGGGGGFFFFFFFFMMMMMMMMssssssFFWWWWW",
        /*4-|--------------|--------------|--------------|--------------|--------------|--------------|--------------|--------------|------*/
            "GGGFFFFFFPPPPFFFFFFFFGGGGGGMMMMmmmmmmWWWWWWWWWMMPPMMMMMGGGMMMWWWWWWWWWWWWWWMMmmmmGGGGGGGGGGGGGGFFFFFFFFFFFssssssssFFWWWW",
            "GGGFFFFFFFFFFFFFFFFFMMMMMMMMMMMMMMMWWWWWWWWWWWWMMPPMMMGGGMMMWWWWWWWWWWWWWWMMMmmmGGGGGGGGGGGGGGGGFFFFFFFFFssssssssFFFFWWW",
            "GGGGFFFFFFFFFFFFFFMMMMMMMMMMMFFFFWWWWWWWWWWWWWWWMMPPMMMGGGMMMWWWWWWWWWWWWWWMMMmmmGGGGGGGGGGGGGGGFFFFFFFFFFssssssFFFFFWWW",
            "WGGGGFFFFFFFFFmmmMMMMMMFFFFFFFFFGGWWWWWWWWWWWWWWMMPPPPMMGGGMMWWWWWWWWWWWWWWWMMMmmmmmmmmFFFGGGGGFFFFFFFFFFFFssssFFFFFFFWW",
            "WWGGGGFFFFFFFmmmmmmMMMFFFFFFFFFGGGGGWWWWWWWWWWWWWMMPPPPPPMMMWWWWWWWWWWWWWWWWWMMmmmmmmmFFFFFGGGFFFFMMMMMMMMFFFFFFFFFFFFFW",
            "WWWWGGGGFFFFFFFFmmmmmFFFFFFFFFGGGGGGGWWWWWWWWWWWWWMMMPPMMMWWWWWWWWWWWWWWWWWWWWWWmmmmmFFFFFFFFFFFMMMGGGGGMMMMMMFFFFFFFFFF",
            "WWWWWWGGGGFFFFFFFmmmmmmFFFFFGGGGGGGGWWWWWWWWWWWWWWWWMMMMWWWWWWWWWWWWWWWWWWWWWWWWWWFFFFFFFFFFFFFMMMGGGGGGGGGMMMMFFFFFFFFF",
            "WWWWWWWGGGGGFFFFFFmmmFFFFFFGGGGGGGGWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWFFFFFFFFFFFMMGGGFFFFFGGGMMMMMFFFFFFF",
            "WWWWWWWWGGGGGGFFFFFFFFFFFFGGGGGGGWWWWWGGGGGGGWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWFFFFFFFFGGGGGFFFFFFFGGGGMMMFFFFFFF",
            "WWWWWWWWWGGGGGGFFFFFFFFFFGGGGGWWWWWWGGGGGGGWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWFFFFFFFFFGGGGGFFWWWWWFFGGGGMMMFFFFFF",
            "WWWWWWWWWWWGGGGGGFFFFFFFFGGGGGGWWWWGGGGGGGWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWFFFFFFFFFFGGGGGFFWWWWWWWFFGGGMMFFFFFFF",
            "WWWWWWWWWWWWGGGGGGGFFFFFFFFGGGGGGGGGGGGGGWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWFFFFFFFFFFGGGFFWWWGGGWWWFFGGMMMFFFFFF",
            "WWWWWWWWWWWWWWGGGGGGFFFFFFFFFGGGGGGGGGGWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWFFFFFFFFGGFFWWWGTGsssFFGGMMFFFFFFF",
            "WWWWWWMMMMMMWWWWWWWWWFFFFFFFFFFFFGGGGWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWFFFFFFFFFFFFFWWWGGGWWWFFGGMMFFFFFFF",
            "WWWWWMMMFFFFFFWWWWWWWWWFFFFFFFFFFFGGGGWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWFFFFFFFFFFFFFWWWWWWWFFGGMMFFFFFFFW",
        /*5-|--------------|--------------|--------------|--------------|--------------|--------------|--------------|--------------|------*/
            "WWWWMMMFFFFFFFFFFWWWWWFFFFFFFFFFFGGGGGGWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWMMMMMMMMWWWWWWWWWFFFFFFFFFFFFFWWWWWFFFMMMMFFFFFFWW",
            "WWWMMMFFFFFFFFGGGGWWWWWWFFFFFFFFGGGGGGGGGGWWWWWWWWWWWWWWWWWWWWWWWWWWMMMMMsssssssWWWWWWWWWFFFFFFFFFMMMMMFFFFFFFFFFFFFFFWW",
            "WWMMMFFFFFFGGGGGGGGGGWWWWFFFFFFFGGGGGGGGGGGWWWWWWWWWWWWWWWWWWWWWWWWssssssssMMMMssWWWWWWWFFFFFFFFFFFMMMMMFFFFFFFFFFFFFWWW",
            "WMMMFFFFFFGGGGGGGGGGGGGWFFFFFFFGGGGGGFFGGGGGWWWWWWWWWWWWWWWWWWWWWWMMMMMMMMMMMMMMssWWWWWWWFFFFFFFFFFFFMMMMmmmFFFFFFFFGGWW",
            "MMMFFFFGGGGGGGGGFFFFGGGBFFFFFFFGGGGGFFFFGGGGGWWWWWWWWWWWWWWMMMMMMMMMMssssssMMMMMMsWWWWWWWWWFFFFFFFFFFFMMMmmmmFFFFFFGGGGG",
            "MMMFFFGGGGGGGGFFFFFFFFFWWFFFFFGGGGGFFFFFFGGGGWWWWWWWWWWWMMMMMMMMsssssssssssssssMMsMMWWWWWWFFFFFFFFFFFFFFMMmmmFFFFFGGGGGG",
            "MMFFFFFGGGGGFFFFFFFFFFFFWWFFFFGGGGFFFFFFFFGGGGWWWWWWWWMMMMMMMMMssMMMMMMMMMMMMssMMsMMWWWWWWWFFFFFFFFFFFFFFMMmmmFFFFFGGGGG",
            "FFFFFGGGGGGmmFFFFFFFFFFFMMMMFFFGGGGFFFFFFGGGGGWWWWWWWMMMMMMMMMssMMMMssssssssMMsMMsMMMWWWWWWWWFFFFFFFFFFFFFMMmmFFFFFGGGGG",
            "FFFFGGGGGGmmmmFFFFFFFFFMMMMMMMMGGGGGFFFFGGGGGGWWWWWWWWMMMMMMMMsMMMMMMMMMsssMMMssMsMMMMWWWWWWWFFFFFFFFFFFFFMMmmFFFFFFGGGG",
            "FFFFFGGGGmmmmFFFFFFFFFMMMMMMMMMMMGGGGGGGGGGGGWWWWWWWWWWWmmsssssMMMMMMMMMMsMMMMMssssMMMWWWWWWWWFFFFFFFFFFFFFMMmmmFFFFFGGW",
            "FFFFFGGmmmmmFFFFFFFFFMMMMMMMMMMMMMMGGGGGGGGWWWWWWWWWWWmmmmmMMMssMMMMMMMMMsMMMMMMMMFMMMMWWWWWWWWFFFFFFFFFFFFFMMFFFFFFFFWW",
            "WWFFFFFmmmmmmFFFFFMMMMMsssssssMMMMMMMGGGGWWWWWWWWWFFFmmmmmmmMMMsssssMMMMMsMMMMMMMFFFMMMWWWWWWWWWWWFFFFFFFFmmmmFFFFFFFFWW",
            "WWWFFFFFmmmmmmFFMMMssssssssssssMMMMMWWWWWWWWWWWWWFFFFFmmmmmMMMMMMMMMMMMMMsssssssFFFFFMMMWWWWWWWWWWWWFFFFFmmmmmFFFFFFFFWW",
            "WWFFFFFFmmmmmmmmmsssssssssssssssMMMWWWWWWWWWWWWFFFFFFmmmmmmMMMMMMMGGGMMMMMMMMMMFFFFFFFMMWWWWWWWWWWWWWFFFFFFmmmmFFFFFFWWW",
            "FFFFFFFFFmmmmmmmsssssssssTsssssMMWWWWWWWWWWWWFFFFFFmmmmmmmmMMFFFGGGGWWWWMMMMMMMMFFFFFMMWWWWWWWWWWWWWWWFFFFFFmmmmFFFWWWWW",
        /*6-|--------------|--------------|--------------|--------------|--------------|--------------|--------------|--------------|------*/
            "FFFFFFFFFFFmmmmmssssssssssssssWWWWWWFFFFFFFFFFFFFmmmmmmmmmMMFFFFFGGGGGWWWPPPPPMMMMFFMMWWWWWWWWWWWWWWFFFFFFFmmmmmmFFFWWWW",
            "WFFFFFFFFFFFFmmssssssssssssWWWWWWWFFFFFFFWWWWWWWmmmmmmmMMMMFFFFFFGGGGGBPPPPPGGGGMMMFWWWWWWWWWWWWWWWWWFFFFFFFmmmmFFFFFWWW",
            "WWWWWFFFFFFFFFsssssssssssWWWWWWWFFFFWWWWFFFFFFmmmmmmmMMMFFFFFFFFFFGGGWWPPPPGGGGGGMMGGWWWWWWWWWWWWWWWWFFFFFFFmmmFFFFFWWWW",
            "WWWWWWWWWWWFFsssssssssssssWWWWWFFFFFFFFWWWWWWWWmmmmmMMFFFFFFFFFFFWWWWPPPPPGGGGGGMMMMGGWWWWWWWWWWWWWWWWFFFFmmmmFFFFFWWWWW",
            "WWWWWWWWsssssssssssssssWWWWWWWWWWFFFFFFFFFFFFFFFmmmMMFFFFFFFFWWWWWWWPPPPPGGGGGGMMMMMGWWWWWWWWWWWWWWFFWWFFFFmmmmFFFFFWWWW",
            "WWWWsssssssssssssssssssssWWWWWFFFFFFFFWWWWFFFFFFFMMMFFFFFWWWWWWWWWWWWPPPGGGGGGGFFMMGGGWWWWWWWWWWWWFFFFWGFFFFmmFFFFFWWWWW",
            "WWssssssmmmmmmsssssssssssFFFFFWWWWWWWWWWWWWFFFFMMMFFFFFWWWWWWWWWWWWWGGGGGGGGGGGFFFMMGGGWWWWWWWWWWFFFFFWWFFFFFFFFFFWWWWWW",
            "WWWsssmmmmFFFFFsssssssssFFFFFFFFFFFFFFFWWWFFFMMFFFFFFFWWWWWWWWWWWFFFFGGGGGGGGGFFFFFMMMGGWWWWWWWWWWWFFFFWWFFFFFFFFFWWWWWW",
            "WWmmmmmmFFFFFFFFFFsssssFFFFFFFFFFFFFFFFFBFFMMMFFFFFFFWWWWWWWFFFFFFFFFFGGGGGGGFFFFFFFFMMGGWWWWWWWWWFFFFFFWWFFFFFFFWWWWWWW",
            "WmmmmmFFFFFFFFFFFFFFssssFFFFFFFFFFFFFFWWWWMMFFFFGGGGWWWWWWWWWWFFFFFFFFFGGGGGGFFFFFFFMMGGGWWWWWWWWWFFPFFFFBFFFFFFWWWWWWWW",
            "mmmmmmmFFFFFFFFFFFFFFssssFFFFFFFFFFFWWWWWWWWWGGGGGGWWWWWWWWWWFFFFFFFFFFwwGwwFFFFFFFMMMMGGGWWWWWWWFFPPPFFFWWFFFFWWWWWWWWW",
            "mmmmmMMMMFFFFFFFFFFFFsssssFFFFFFFWWWWWWWWWWWGGGGGGWWWWWWWWWWWWFFFFFFFFFwGGGwFFFFFFFMMMMMGGGWWWWWWFFFPPPFFWWFFFWWWWWWWWWW",
            "mmmmmmMMMMMFFFFFFFFFsssssssFFFFFFMMWWWWMMMMMGGGGGGWWWWWWWWWWWWWWFFFFFFFwGTGwFFFFFFFFMMMMMmmmWWWWWWFFFPPFFFWWWWWWWWWWWWWW",
            "mmmmmmmmMMMMMFFFFFFFssssssssFFFFFMMMWWMMMMGGGGGGGWWGGGGWWWWWWWWWWWFFFFFwGGGwFFFFFFFFFMMmmmmmWWWWWWFFGGGGFFFWWWWWWWWWWWWW",
            "mmmmmmmMMMMMMMMMFFFFssssssssmmFFFFMMMMMMMGGGGGGGGBGGGGGFFFFFWWWWWWWFFFFwwwwwFFFFFFFFFMMMmmmmmmWWWWWFFGGGmmmmGGGWWWWWWWWW",
        /*7-|--------------|--------------|--------------|--------------|--------------|--------------|--------------|--------------|------*/
            "mmmmmmmMMFFFFFMMMMMMMsssssmmmmmmFFFMMMMMFFFFFGGGWWGGGGFFFFFFFFFFMMMMFFFFFFFFFFFFFFFFMMMmmmmmmWWWWWWWWGGmmmmmmmGGGGGGWWWW",
            "WmmmmmMMFFFFFFFFMMMMMMMssmmmmmmmmMMMMMMFFFFFFFWWWFFFGGGGGFFFFFFFFMMMMMMFFFFFFFFFFMMMMMMmmmmmWWWWWWWWWWmmmMMMMMmmmGGGGGWW",
            "WWWmmmMMFFFFFGGGGGMMMMmmmmmmmmmmmmMMMMMMFFFFFWWWFFFFFGGGGGGFFFFFFFFMMMMMMMMFFFFMMMMMMMmmmmmmmWWWWWWWWmmmMMMFFMMMmmGGGGWW",
            "WWWWWmmMMFFFGGGGGGGmmmmmmmmmmmmmMMMMMMMFFFFFWWWFFFFFFFGGGGGGFFFFFFFFMMMMMMMMMMMMMMMMMmmmmmmmmmWWWWWWmmmMMMFFFFMMmmmGWWWW",
            "WWWWmmmmMMMGGGGGGGmmmmmmmmmmmmmMMMMMMMFFFFFWWWWFFFFFFGGGGGGGGGFFFFFPPPMMMMMMMMMMMPPPPPmmmmmmWWWWWWWmmmMMMFFFSFFMMGGWWWWW",
            "WWWmmmmmMMGGGGGGGGGmmmmmmmmmmMMMMMMFFFFFFFFWWWWWFFFFGGGGGGGGGGFFFPPPPPPPPMMMMMMMPPPPPPPmmmmmmWWWWWWWmmmMMFFFFFMMMMGGGGWW",
            "WWWWmmmmMMGGGGGGGGGGmmmmmmmmMMMMMMFFFFFFFFFWWWWFFFFFGGGGGGGGGGFFFPPPPPPPPPMMMMMPPPPPPPPPmmmmWWWWWWWWWmmmMMFFFFMMmmmGGGWW",
            "WWWWWmmmmmGGGGGGGGGGmmmmmmmmmMMMMFFFFFFFFFWWWWWWFFFFFGGGGGGGGFFFPPPPPPPPPPPMMMPPPPPPPPPPPmmWWWWWWWWWWmmmMMMFMMMmmmGGGWWW",
            "WWWWWWWmmmmGGGGGGGGmmmmmmmmmMMMMFFFFFFFFFWWWWWWWFFFFFFFGGGGGGFFFFPPPPPPPPPPPPPPPPPPPPPPPPPWWWWWWWWWWWWmmmMMFMMmmmGGGWWWW",
            "WWWWWWmmmmmmGGGGGGmmmmWWWMMMMMMMMFFFFFFFWWWWWWWWWFFFFFFFFGGGFFFFFPPPPPPPPPPPWWPPPPPPPPPPPWWWWWWWWWWWWWmmmmmmmmmGGGGWWWWW",
            "WWWWWWWmmmmmmGGGGmmmmWWWWWFFFFFFFFFFFFFWWWWWWWWWWWWFFFFFFFFFFFFFPPPPPPPPPPPWWWWPPPPPPPPPWWWWWWWWWWWWWWmmmmmmPPPWWWWWWWWW",
            "WWWWWWWWmmmmmmmmmmmmmmWWWFFFFFFFFFFFFWWWWWWWWWWWWWWWWFFFFFFFFFFPPPPPPPPPPPWWWWWWWWPPPPWWWWWWWWWWWWWWWWWmmmmPPWWWWWWWWWWW",
            "WWWWWWWWWmmmmmmmmmmmmmBmmmmmmFFFFFWWWWWWWWWWWWWWWWWWWWWFFFFFPPPPPPPPPPPPPWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWmmPPWWWWWWWWWWWW",
            "WWWWWWWWWWWmmmmmmmmmmWWWmmmmmmmWWWWWWWWWWWWWWWWWWWWWWWWWWWWPPPPPPPPPPPPPWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWPPPPWWWWWWWWWWWW",
            "WWWWWWWWWWWWmmmmmmmWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWPPPPPPPPPPWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWPPPWWWWWWWWWWWWW",
        /*8-|--------------|--------------|--------------|--------------|--------------|--------------|--------------|--------------|------*/
        ];
        // Rellenar layout extra con agua
        const existingRows = mapLayout.length;
        for (let i = 0; i<MAP_HEIGHT-existingRows; i++){
            mapLayout.push('W'.repeat(MAP_WIDTH));
        }

        // Función de generación de mapa
        const generateWorldMap = () => {
            const map = [];

            for(let y=0; y<MAP_HEIGHT; y++){
                const row = [];
                for(let x=0; x<MAP_WIDTH; x++){
                    // Determinar la zona de enemigos
                    const zoneX = Math.floor(x / (MAP_WIDTH / 8));
                    const zoneY = Math.floor(y / (MAP_HEIGHT / 8));
                    const zone = zoneMap[zoneY]?.[zoneX] ?? 0;

                    // Determinar el tipo de terreno con mapLayout
                    let baseType = 'grass'; // Por defecto
                    const layoutChar = mapLayout[y]?.[x];

                    switch(layoutChar){
                        case 'T': baseType = 'town'; break;
                        case 'C': baseType = 'castle'; break;
                        case 'B': baseType = 'bridge'; break;
                        case 'D': baseType = 'dungeon'; break;
                        case 'S': baseType = 'stairs'; break;
                        case 'W': baseType = 'water'; break;
                        case 'M': baseType = 'high-mountain'; break;
                        case 'G': baseType = 'grass'; break;
                        case 'm': baseType = 'mountain'; break;
                        case 'F': baseType = 'tree'; break;
                        case 'P': baseType = 'poison-swamp'; break;
                        case 's': baseType = 'sand'; break;
                        case 'w': baseType = 'wall'; break;
                    }

                    // Crear el tile con su grografía y su zona
                    const tile = {
                        x, y,
                        type: baseType,
                        zone: zone,
                        features: []
                    };
                    row.push(tile);
                }
                map.push(row);
            }

            return map;
        };

        const currentEncounterTerrain = ref('grass');

        // Monstruos por zona
        const zoneMonsters = {
            0: ['slime', 'red-slime', 'slime', 'red-slime', 'slime'],
            1: ['red-slime', 'slime', 'red-slime', 'drakee', 'red-slime'],
            2: ['slime', 'ghost', 'drakee', 'ghost', 'red-slime'],
            3: ['red-slime', 'red-slime', 'drakee', 'ghost', 'magician'],
            4: ['ghost', 'magician', 'magidrakee', 'magidrakee', 'scorpion'],
            5: ['ghost', 'magician', 'magidrakee', 'scorpion', 'skeleton'],
            6: ['magidrakee', 'scorpion', 'skeleton', 'warlock', 'wolf'],
            7: ['skeleton', 'warlock', 'metal-scorpion', 'wolf', 'wolf'],
            8: ['metal-scorpion', 'wraith', 'wolflord', 'wolflord', 'goldman'],
            9: ['wraith', 'wyvern', 'wolflord', 'wyvern', 'goldman'],
            10: ['wyvern', 'rogue-scorpion', 'wraith-knight', 'knight', 'demon-knight'],
            11: ['wraith-knight', 'knight', 'magiwyvern', 'demon-knight', 'metal-slime'],
            12: ['knight', 'magiwyvern', 'demon-knight', 'werewolf', 'starwyvern'],
            13: ['werewolf', 'green-dragon', 'starwyvern', 'starwyvern', 'wizard'],
            14: ['poltergeist', 'droll', 'drakeema', 'skeleton', 'warlock'],
            15: ['specter', 'wolflord', 'druinlord', 'drollmagi', 'wraith-knight'],
            16: ['werewolf', 'green-dragon', 'starwyvern', 'wizard', 'axe-knight'],
            17: ['wizard', 'axe-knight', 'blue-dragon', 'blue-dragon', 'stoneman'],
            18: ['wizard', 'stoneman', 'armored-knight', 'armored-knight', 'red-dragon'],
            19: ['ghost', 'magician', 'scorpion', 'druin', 'druin']
        };

        // Tabla de experiencia
        const expTable = {
            1: 0, 
            2: 10, 
            3: 35, 
            4: 80, 
            5: 150, 
            6: 200, 
            7: 340, 
            8: 540, 
            9: 820, 
            10: 1200, 
            11: 1600, 
            12: 2140, 
            13: 2840, 
            14: 3720, 
            15: 4820, 
            16: 6170, 
            17: 7870, 
            18: 10120, 
            19: 13000, 
            20: 17000, 
        };

        // Lista de Items
        const allItems = {
            // Consumibles
            'herb': {
                name: 'Hierba Curativa',
                type: 'consumable',
                description: 'Hierba medicinal que restaura una pequeña cantidad de salud.',
                attack: null,
                defense: null,
                buy: 24,
                sell: null,
                stackable: true
            },
            'wing': {
                name: 'Ala de Quimera',
                type: 'consumable',
                description: 'Ala de un monstruo que te puede regresar al castillo de Tantegel.',
                attack: null,
                defense: null,
                buy: 70,
                sell: null,
                stackable: true
            },
            'torch': {
                name: 'Antorcha',
                type: 'consumable',
                description: 'Ilumina temporalmente lugares oscuros.',
                attack: null,
                defense: null,
                buy: 8,
                sell: null,
                stackable: true
            },
            'holy-water': {
                name: 'Agua Bendita',
                type: 'consumable',
                description: 'Mantiene alejados a los enemigos.',
                attack: null,
                defense: null,
                buy: 38,
                sell: null,
                stackable: true
            },
            

            // Armas
            'bamboo-pole': {
                name: 'Palo de Bamboo',
                type: 'weapon',
                description: null,
                attack: 2,
                defense: null,
                buy: 10,
                sell: 5,
                stackable: false
            },
            'club': {
                name: 'Garrote de Roble',
                type: 'weapon',
                description: null,
                attack: 4,
                defense: null,
                buy: 60,
                sell: 30,
                stackable: false
            },
            'copper-sword': {
                name: 'Espada de Cobre',
                type: 'weapon',
                description: null,
                attack: 10,
                defense: null,
                buy: 180,
                sell: 90,
                stackable: false
            },
            'iron-axe': {
                name: 'Hacha de Hierro',
                type: 'weapon',
                description: null,
                attack: 15,
                defense: null,
                buy: 560,
                sell: 280,
                stackable: false
            },
            'steel-bradsword': {
                name: 'Espada ancha de Acero',
                type: 'weapon',
                description: null,
                attack: 20,
                defense: null,
                buy: 1500,
                sell: 750,
                stackable: false
            },
            'fire-blade': {
                name: 'Espada de Fuego',
                type: 'weapon',
                description: null,
                attack: 28,
                defense: null,
                buy: 9800,
                sell: 4900,
                stackable: false
            },
            'erdrick-sword': {
                name: 'Espada de Eldrick',
                type: 'weapon',
                description: null,
                attack: 40,
                defense: null,
                buy: null,
                sell: null,
                stackable: false
            },

            // Armaduras
            'clothes':{
                name: 'Ropas Simples',
                type: 'armor',
                description: null,
                attack: null,
                defense: 2,
                buy: 20,
                sell: 10,
                stackable: false
            },
            'lether-armor':{
                name: 'Armadura de Cuero',
                type: 'armor',
                description: null,
                attack: null,
                defense: 4,
                buy: 70,
                sell: 35,
                stackable: false
            },
            'chain-mail':{
                name: 'Armadura de Cadenas',
                type: 'armor',
                description: null,
                attack: null,
                defense: 10,
                buy: 300,
                sell: 150,
                stackable: false
            },
            'iron-armor':{
                name: 'Armadura de Hierro',
                type: 'armor',
                description: null,
                attack: null,
                defense: 16,
                buy: 1000,
                sell: 500,
                stackable: false
            },
            'full-plate-armor':{
                name: 'Armadura de Placas de Acero',
                type: 'armor',
                description: null,
                attack: null,
                defense: 24,
                buy: 3000,
                sell: 1500,
                stackable: false
            },
            'magic-armor':{
                name: 'Armadura Mágica',
                type: 'armor',
                description: null,
                attack: null,
                defense: 26,
                buy: 7700,
                sell: 3850,
                stackable: false
            },
            'erdrick-armor':{
                name: 'Armadura de Eldrick',
                type: 'armor',
                description: null,
                attack: null,
                defense: 36,
                buy: null,
                sell: null,
                stackable: false
            },

            // Escudos
            'leather-shield':{
                name: 'Escudo de Cuero',
                type: 'shield',
                description: null,
                attack: null,
                defense: 4,
                buy: 90,
                sell: 45,
                stackable: null
            },
            'iron-shield':{
                name: 'Escudo de Hierro',
                type: 'shield',
                description: null,
                attack: null,
                defense: 10,
                buy: 800,
                sell: 400,
                stackable: null
            },
            'silver-shield':{
                name: 'Escudo de Plata',
                type: 'shield',
                description: null,
                attack: null,
                defense: 20,
                buy: 14800,
                sell: 7400,
                stackable: null
            },
            'erdrick-shield':{
                name: 'Escudo de Eldrick',
                type: 'shield',
                description: null,
                attack: null,
                defense: 29,
                buy: null,
                sell: null,
                stackable: null
            },

            // Accesorios
            'dragon-scale':{
                name: 'Escama de Dragón',
                type: 'accessory',
                description: null,
                attack: 0,
                defense: 2,
                buy: 20,
                sell: null,
                stackable: false
            },
            'warriors-ring':{
                name: 'Anillo de Guerrero',
                type: 'accessory',
                description: null,
                attack: 2,
                defense: 0,
                buy: null,
                sell: null,
                stackable: false
            },
            'erdricks-mark':{
                name: 'Marca de Eldrick',
                type: 'accessory',
                description: null,
                attack: 2,
                defense: 2,
                buy: null,
                sell: null,
                stackable: false
            },
        };

        // Inventario del jugador
        const inventory = ref([]);

        // Equipo del jugador
        const equipment = ref({
            weapon: allItems["iron-axe"],
            armor: allItems["iron-armor"],
            shield: allItems["iron-shield"],
            accessories: []
        });

        /*--- FUNCIONES DE INVENTARIO Y EQUIPO ---*/
        const addItemToInventory = (itemId) => {
            // Busca objeto en la base de datos de los objetos
            const idemData = allItems[itemID];
            if(!itemData){
                console.error("Objeto no encontrado: ", itemID);
                return;
            }

            // Si el objeto es apilable, busca si ya existe en el inventario
            if(itemData.stackable){
                const existingItem = inventory.value.find(item => item.id === itemID);
                if(existingItem){
                    existingItem.quantity++;
                    return; // Objeto apilado
                }
            }

            // Si no se puede apilar, intentar añadirlo a un nuevo espacio
            if(inventory.value.length < 8){
                inventory.value.push({
                    id: itemId,
                    name: itemData.name,
                    type: itemData.type,
                    description: itemData.description,
                    attack: itemData.attack,
                    defense: itemData.defense,
                    buy: itemData.buy,
                    sell: itemData.sell,
                    stackable: itemData.stackable,
                    quantity: 1
                });
            } else {
                console.log("El inventario está lleno.");
                addLogMessage("El inventario está lleno.");
            }
        };

        // Equipar un objeto desde el inventario.

        const equipItem = (inventoryIndex) =>{
            // Guardar objeto en memoria
            const item = inventory.value[inventoryIndex];

            // Si el objeto no se puede equipar
            if(!item || !['weapon', 'armor', 'shield', 'accessory'].includes(item.type)){
                // TODO: Usar objeto en vez de equiparlo
                return;
            }

            // Eliminar objeto del inventario
            inventory.value.splice(inventoryIndex, 1);

            // Equipar objeto
            switch(item.type){
                case 'weapon':
                    // Si ya hay algo equipado, devolverlo al inventario
                    if(equipment.value[item.type]){
                        addItemToInventory(equipment.value[item.type].id);
                    }
                    equipment.value[item.type] = item;
                    break;
                case 'armor':
                    // Si ya hay algo equipado, devolverlo al inventario
                    if(equipment.value[item.type]){
                        addItemToInventory(equipment.value[item.type].id);
                    }
                    equipment.value[item.type] = item;
                    break;
                case 'shield':
                    // Si ya hay algo equipado, devolverlo al inventario
                    if(equipment.value[item.type]){
                        addItemToInventory(equipment.value[item.type].id);
                    }
                    equipment.value[item.type] = item;
                    break;
                case 'accessory':
                    // Si hay menos de 3 accesorios, equiparlo
                    if(equipment.value.accessories.length < 3){
                        equipment.value.accessories.push(item);
                    } else {
                        addLogMessage('No puedes equiparte más accesorios.');
                        addItemToInventory(item.id);
                    }
                    break;
            }
        };

        // Datos de batalla
        const playerLevel = ref(1);
        const maxPlayerHealth = ref(15);
        const playerHealth = ref(15);
        const basePlayerAttack = ref(4);
        const basePlayerDefense = ref(2);
        const maxPlayerMana = ref(0);
        const playerMana = ref(0);
        const playerMagicPower = ref(3);
        const playerEXP = ref(0);
        const playerGold = ref(0);
        const expToNextLevel = ref(expTable[2]);
        const currentRound = ref(0);
        const winner = ref(null);
        const logMessages = ref([]);
        const levelingUp = ref(false);

        // Datos de batalla del monstruo
        const monsterHealth = ref(3);
        const maxMonsterHealth = ref(3);
        const baseMonsterAttack = ref(5);
        const baseMonsterDefense = ref(1);
        const monsterXP = ref(2);
        const monsterGold = ref(2);
        const currentMonster = ref({
            name: 'Slime', 
            level: 1,
            color: '#12b3f3ff'
        });

        // Estados de animación
        const monsterBlinking = ref(false);
        const monsterCasting = ref(false);
        const playerShaking = ref(false);
        const playerHealing = ref(false);

        // Estados de sonido
        const musicEnabled = ref(true);
        const sfxEnabled = ref(true);
        const backgroundMusic = ref(null);
        const battleMusic = ref(null);
        const battleMusicStart1 = ref(null);
        const battleMusic1 = ref(null);
        const battleMusicStart2 = ref(null);
        const battleMusic2 = ref(null);
        const battleMusic3 = ref(null);
        const hitSound = ref(null);
        const fireSound = ref(null);
        const missSound1 = ref(null);
        const missSound2 = ref(null);
        const criticalHitSound = ref(null);
        const playerAttackSound = ref(null);
        const enemyAttackSound = ref(null);
        const healSound = ref(null);
        const spellSound = ref(null);
        const victorySound = ref(null);
        const levelupSound = ref(null);
        const defeatSound = ref(null);
        const fleeSound = ref(null);
        const menuSound = ref(null);

        // Menú del juego
        const activeMenu = ref('none');

        // Ocultar menú de pelea y abrir menú de hechizos
        const showSpells = ref(false);

        // Estado del juego
        const mode = ref('exploration'); // or battle
        const transitionActive = ref(false);
        const isActionInProgress = ref(false);

        // Posición del jugador en el mapa (zona 0)
        const playerTile = ref({ x: 44, y: 42 });
        const playerDirection = ref('down');

        // Cámara del juego
        const camera = ref({
            x: playerTile.value.x * TILE_SIZE - (VIEWPORT_WIDTH / ZOOM_LEVEL.value / 2) + (TILE_SIZE / 2),
            y: playerTile.value.y * TILE_SIZE - (VIEWPORT_HEIGHT / ZOOM_LEVEL.value / 2) + (TILE_SIZE / 2),
        });

        // Matriz del mapa mundial
        const worldMap = ref([]);

        /*--- Métodos computados ---*/
        // Tiles visibles en la vista actual
        const visibleTiles = computed(() => {
            if (!worldMap.value.length) return []; // Prevenir errores antes de que el mapa se genere
            const tiles = [];
            const startX = Math.max(0, Math.floor(camera.value.x / TILE_SIZE));
            const startY = Math.max(0, Math.floor(camera.value.y / TILE_SIZE));
            const endX = Math.min(MAP_WIDTH, startX + Math.ceil(VIEWPORT_WIDTH / TILE_SIZE) + 1);
            const endY = Math.min(MAP_HEIGHT, startY + Math.ceil(VIEWPORT_HEIGHT / TILE_SIZE) + 1);

            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    if (worldMap.value[y]?.[x]) {
                        tiles.push(worldMap.value[y][x]);
                    }
                }
            }
            return tiles;
        });

        const getTotalAttack = () =>{
            let totalAttack = basePlayerAttack.value;
            if(equipment.value.weapon){
                totalAttack += equipment.value.weapon.attack;
            }
            if(equipment.value.accessories){
                for(accesory in equipment.value.accessories){
                    if(accesory.attack){
                        totalAttack += accesory.attack;
                    }
                }
            }
            
            return totalAttack;
        };

        const getTotalDefense = () =>{
            let totalDefense = basePlayerDefense.value;
            if(equipment.value.armor){
                totalDefense += equipment.value.armor.defense;
            }
            if(equipment.value.shield){
                totalDefense += equipment.value.shield.defense;
            }
            if(equipment.value.accessories){
                for(accesory in equipment.value.accessories){
                    if(accesory.defense){
                        totalDefense += accesory.defense;
                    }
                }
            }
            
            return totalDefense;
        };

        // Estilo para la cuadrícula del mapa
        const mapGridStyle = computed(() => {
            return {
                // Mover el contenedor en dirección opuesta a la cámara para simular movimiento
                transform: `scale(${ZOOM_LEVEL.value}) translate(${-camera.value.x}px, ${-camera.value.y}px)`,
                transformOrigin: `top left`,
                transition: `all 0.2s`,
            };
        });

        // Sprite del jugador
        const playerSpriteUrl = computed(() => {
            if(equipment.value.weapon && equipment.value.shield){
                return `url('./assets/sprites/hero/Hero-${playerDirection.value}-Sword-Shield.gif')`
            } else if(!equipment.value.weapon && equipment.value.shield){
                return `url('./assets/sprites/hero/Hero-${playerDirection.value}-nSword-Shield.gif')`
            } else if(equipment.value.weapon && !equipment.value.shield){
                return `url('./assets/sprites/hero/Hero-${playerDirection.value}-Sword-nShield.gif')`
            } else {
                return `url('./assets/sprites/hero/Hero-${playerDirection.value}-nSword-nShield.gif')`
            }
        });

        // Estilo para el jugador
        const playerStyle = computed(() => {
            const scaledTileSize = TILE_SIZE * ZOOM_LEVEL.value;

            return {
                left: (VIEWPORT_WIDTH / 2 - scaledTileSize / 2) + 'px',
                top: (VIEWPORT_HEIGHT / 2 - scaledTileSize / 2) + 'px',
                
                width: scaledTileSize + 'px',
                height: scaledTileSize + 'px',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
                backgroundImage: playerSpriteUrl.value
            };
        });

        // Estilo para el mini mapa
        const miniMapPlayerStyle = computed(() => {
            return{
                left: (playerTile.value.x / MAP_WIDTH * 100) + '%',
                top: (playerTile.value.y / MAP_HEIGHT * 100) + '%'
            };
        });

        // Zona actual del jugador
         const currentZone = computed(() => worldMap.value[playerTile.value.y]?.[playerTile.value.x]?.zone ?? 'N/A');

        const monsterHealthBarStyles = computed(() => {
            return {
                width: (monsterHealth.value / maxMonsterHealth.value) * 100  + '%'
            };
        });

        const playerHealthBarStyles = computed(() => {
            return {
                width: (playerHealth.value / maxPlayerHealth.value) * 100 + '%'
            };
        });

        const playerManaBarStyles = computed(() => {
            return {
                width: (playerMana.value / maxPlayerMana.value) * 100 + '%'
            };
        });

        // Estilo de texto si el estado es crítico
        const criticalText = computed(() => {
            if (playerHealth.value <= 0) {
                return 'dead__condition';
            }
            if (playerHealth.value <= maxPlayerHealth.value * 0.25) {
                return 'critical__condition';
            }
            return ''; // Devuelve una cadena vacía si la salud es normal
        });

        const battleBackgroundStyle = computed(() => {
            const backgroundMap = {
                'grass': 'Grass-background.png',
                'mountain': 'Mountain-background.png',
                'sand': 'Sand-background.png',
                'tree': 'Forest-background.png',
                'poison-swamp': 'Poison-background.png'
            }

            const imageName = backgroundMap[currentEncounterTerrain.value] || 'Grass-background.png';

            return{
                backgroundImage: `url('./assets/sprites/backgrounds/${imageName}')`
            };
        })

        /*--- Watchers ---*/
        watch(playerHealth, async(value) => {
            await delay(1000);
            if(value <= 0){
                stopMusic();
                winner.value = 'monster';
                playSound(defeatSound, 0.7);
                // TODO: Pantalla de Game Over
            }
        });

        watch(monsterHealth, async(value) => {
            if(value <= 0){
                stopMusic();
                winner.value = 'player';
                logMessages.value = [];
                playSound(victorySound, 0.9);
                defeatMonster();
            }
        });

        watch(mode, (newMode) => {
            if(newMode === 'exploration'){
                stopMusic();
                playMusic(backgroundMusic);
            } else if(newMode === 'battle'){
                stopMusic();
                playBattleMusics();
            }
        });

        // Obtener la tasa de encuentro para el terreno y zona actual
        const getEncounterRate = (terrainType, zone) => {
            const key = zone === 0 ? `0-${terrainType}` : `other-${terrainType}`;
            return encounterRates[key] || 0;
        };

        // Iniciar un encuentro aleatorio
        const startRandomEncounter = () => {
            // Obtener los monstruos posibles para esta zona
            const possibleMonsters = zoneMonsters[currentZone.value] || zoneMonsters[0];

            // Seleccionar un monstruo aleatorio
            const randomIndex = Math.floor(Math.random() * possibleMonsters.length);
            const monsterType = possibleMonsters[randomIndex];

            console.log('Monstruos posibles: ', possibleMonsters)
            console.log('Monstruo de encuentro: ', monsterType);

            // Iniciar la batalla
            startBattle(monsterType);
        };

        // Obtener clase CSS para una tile (grass, mountain, etc.)
        const getTileClass = (tile) => {
            if (!tile) return '';
            if (
                tile.type === 'grass' ||
                tile.type === 'water' || 
                tile.type === 'high-mountain' || 
                tile.type === 'town' || 
                tile.type === 'castle' || 
                tile.type === 'dungeon' ||
                tile.type === 'stairs' ||
                tile.type === 'bridge' ||
                tile.type === 'mountain' ||
                tile.type === 'tree' ||
                tile.type === 'sand' ||
                tile.type === 'poison-swamp' ||
                tile.type === 'wall'
            ) {
                return tile.type;
            }
            return `zone-${tile.zone}`;
        };

        // Obtener estilo para un tile
        const getTileStyle = (tile) => {
            return {
                position: 'absolute',
                left: (tile.x * TILE_SIZE) + 'px',
                top: (tile.y * TILE_SIZE) + 'px'
            };
        };

        // Verificar si un tile es transitable
        const isTilePassable = (tile) => {
            const impassableTiles = ['water', 'high-mountain'];
            return !impassableTiles.includes(tile.type);
        };

        /*--- Manejo de teclas ---*/
        
        // Objeto para rastrear teclas presionadas
        const keysPressed = ref({});

        // Enfriamiento para controlar la velocidad de movimiento (ms)
        const MOVE_COOLDOWN = 250;
        let lastMoveTime = 0;
        let animationFrameId = null; // Para gestionar bucle del juego

        // Mover al jugador
        const movePlayer = async (dx, dy) => {

            // Actualizar dirección basada en el input
            if(dy<0) playerDirection.value = 'up';
            else if(dy>0) playerDirection.value = 'down';
            else if(dx<0) playerDirection.value = 'left';
            else if(dx>0) playerDirection.value = 'right';

            const newX = playerTile.value.x + dx;
            const newY = playerTile.value.y + dy;

            // Verificar límites del mapa y si el tile es transitable
            if (newX >= 0 && newX < MAP_WIDTH && newY >= 0 && newY < MAP_HEIGHT){
                const newTile = worldMap.value[newY]?.[newX];
                if(newTile && isTilePassable(newTile)){
                    if (encounterActive.value) return;
                    else {
                        // Mover al jugador
                        playerTile.value = {x: newX, y: newY};

                        // Actualizar cámara para seguir al jugador
                        camera.value.x = playerTile.value.x * TILE_SIZE - (VIEWPORT_WIDTH / ZOOM_LEVEL.value / 2) + (TILE_SIZE / 2);
                        camera.value.y = playerTile.value.y * TILE_SIZE - (VIEWPORT_HEIGHT / ZOOM_LEVEL.value / 2) + (TILE_SIZE / 2);

                        await delay(200);

                        // Verificar encuentros con monstruos
                        checkMonsterEncounter();
                    }
                }
            }
        };

        // Bucle del juego
        const gameLoop = (timestamp) => {
            if (mode.value !== 'exploration'){
                // Si no está explorando, se detiene el bucle
                animationFrameId = requestAnimationFrame(gameLoop);
                return;
            }

            // Comprueba si ha pasado suficiente tiempo desde el último movimiento
            if((timestamp - lastMoveTime > MOVE_COOLDOWN) && activeMenu.value === 'none'){
                let moved = false;
                // Revisar las teclas presionadas y mover al jugador
                if(keysPressed.value['ArrowUp'] || keysPressed.value['w'] || keysPressed.value['W']){
                    movePlayer(0, -1);
                    moved = true;
                } else if(keysPressed.value['ArrowDown'] || keysPressed.value['s'] || keysPressed.value['S']){
                    movePlayer(0, 1);
                    moved = true;
                } else if(keysPressed.value['ArrowLeft'] || keysPressed.value['a'] || keysPressed.value['A']){
                    movePlayer(-1, 0);
                    moved = true;
                } else if(keysPressed.value['ArrowRight'] || keysPressed.value['d'] || keysPressed.value['D']){
                    movePlayer(1, 0);
                    moved = true;
                }

                if(moved){
                    lastMoveTime = timestamp;
                }
            }
            // Continuar el bucle
            animationFrameId = requestAnimationFrame(gameLoop);
        };

        // Manejadores de eventos para 'keydown' y 'keyup'
        const handleKeyDown = (event) => {
            const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'];
            if(movementKeys.includes(event.key)){
                event.preventDefault(); // Prevenir el scroll de la página con las flechas
                keysPressed.value[event.key] = true;
            }
        };

        const handleKeyUp = (event) => {
            if (keysPressed.value[event.key]){
                keysPressed.value[event.key] = false;
            }
        };

        // Generar número aleatorio de pasos hasta el próximo encuentro (5-20)
        const generateRandomSteps = () => {
            return Math.floor(Math.random() * 36) + 5;
        };

        // Sistema de encuentros aleatorios
        const stepCount = ref(0);
        const stepsUntilEncounter = ref(generateRandomSteps());
        const encounterActive = ref(false);

        // Probabilidades de encuentro por terreno
        const encounterRates = {
            // Zona 0 (alrededor del castillo)
            '0-grass': 1/48,
            '0-forest': 1/32,
            '0-mountain': 1/32,
            '0-water': 0, // No hay encuentros en agua
            '0-town': 0,  // No hay encuentros en pueblos
            '0-castle': 0, // No hay encuentros en castillos

            // Otras zonas
            'other-grass': 1/24,
            'other-forest': 1/16,
            'other-mountain': 1/8,
            'other-water': 0,
            'other-town': 0,
            'other-castle': 0
        };

        // Verificar encuentros con monstruos
        const checkMonsterEncounter = () => {
            if (encounterActive.value) return;

            stepCount.value++;
            console.log('Pasos: ' + stepCount.value);
            console.log('Pasos para combate: ' + stepsUntilEncounter.value)
            const playerCurrentTile = worldMap.value[playerTile.value.y]?.[playerTile.value.x];

            if(playerCurrentTile){
                currentEncounterTerrain.value = playerCurrentTile.type;
            }

            // Verificar si hay que verificar un encuentro
            if (stepCount.value >= stepsUntilEncounter.value){
                stepCount.value = 0;
                stepsUntilEncounter.value = generateRandomSteps();

                startRandomEncounter();
            }
        };

        // Abrir y cerrar menú principal
        const toggleMainMenu = () => {
            playSound(menuSound, 0.7);
            activeMenu.value = activeMenu.value === 'none' ? 'main' : 'none';
        };

        // Submenu específico
        const openSubMenu = (menuName) => {
            playSound(menuSound, 0.7);
            if(['inventory', 'equipment', 'stats'].includes(menuName)){
                activeMenu.value = menuName;
            }
        };

        /*--- Métodos de batalla ---*/

        // Calcular daño de ataques
        const calculateAttackDamage = (attack, defense) => {
            const exhaustion = Math.floor(Math.random() * 2) + 2;// from 2 to 4
            const baseDamage = Math.floor(
                (Math.max(attack - (defense / 2), 1)) / exhaustion
            );
            const variation = Math.floor(baseDamage * 0.2);

            return baseDamage + Math.floor(Math.random() * (variation * 2 + 1)) - variation;
        };

        // Calcular daño de ataque crítico
        const calculateExcellentAttackDamage = (attack) => {
            const exhaustion = Math.floor(Math.random() * 2) + 1;// from 1 to 2
            const baseDamage = Math.floor(attack / exhaustion);

            return baseDamage;
        }

        // Calcular daño de habilidad
        const calculateSpecialAttackDamage = (power) => {
            const baseDamage = Math.floor(
                (Math.random() * (
                    power / 2
                )) + 5
            );
            return baseDamage;
        };

        const calcMonsterDamageSpellDamage = (spell) => {
            if(spell === 'HURT'){
                const baseDamage = 3 + Math.floor(Math.random() * 8);
                if(equipment.value){
                    if (equipment.value.armor.name === 'Armadura Mágica'){
                        return Math.floor(baseDamage / 3) * 2;
                    } else if(equipment.value.armor.name === 'Armadura de Eldrick'){
                        return Math.floor(baseDamage / 3);
                    } else {
                        return baseDamage;
                    }
                } else {
                    return baseDamage;
                }
            } else if(spell === 'HURTMORE'){
                const baseDamage = 30 + Math.floor(Math.random() * 16);
                return Math.floor(baseDamage / 3) * 2;
            }
        };

        const calcMonsterHealSpellValue = (spell) => {
            if(spell === 'HEAL'){
                const baseHeal = 20 + Math.floor(Math.random() * 8);
                return baseHeal;
            } else if(spell === 'HEALMORE'){
                const baseHeal = 85 + Math.floor(Math.random() * 16);
                return baseHeal;
            }
        }

        // Calcular curación de item, hechizo
        const healing = (healingType) => {
            let healingValue = 0;
            // Hechizo cura mínimo 23
            if (healingType === 'spell'){
                healingValue = Math.floor(
                    (Math.random() * (
                        playerMagicPower.value / 2
                    )) + 23
                );
            // Hechizo fuerte cura mínimo 85
            } else if(healingType === 'strong-spell'){
                healingValue = Math.floor(
                    (Math.random() * (
                        playerMagicPower.value / 2
                    )) + 85
                );
            // Hierba curativa cura de 15 a 23
            } else {
                healingValue = Math.floor(
                    (Math.random() * 9) + 15
                );
            }
            
            return healingValue;
        };

        const attackMonster = async () => {
            logMessages.value = [];
            if(isActionInProgress.value) return;
            isActionInProgress.value = true;
            currentRound.value++;

            playSound(playerAttackSound);
            addLogMessage('Atacaste a ' + currentMonster.value.name + '!');
            await delay(500);

            const excellentMoveChance = Math.floor(Math.random() * 4);
            let attackValue = 0;
            let weaponAttack = 0;

            if(equipment.value.weapon){
                weaponAttack = equipment.value.weapon.attack;
            }

            if(excellentMoveChance === 0){
                attackValue = calculateExcellentAttackDamage(basePlayerAttack.value + weaponAttack);
                addLogMessage("Es un movimiento terrífico!");
                playSound(criticalHitSound, 0.7);
                await delay(1000);
            } else {
                attackValue = calculateAttackDamage(
                    basePlayerAttack.value + weaponAttack, baseMonsterDefense.value
                );
            }

            if(attackValue < 1){
                // 50/50 probabilidad de hacer 1 de daño o 0
                if(Math.random() < 0.5){
                    attackValue = 1;
                } else {
                    attackValue = 0;
                }
            }

            if(attackValue === 0){
                playSound(missSound1);
                addLogMessage('Pero fallaste!');
                await delay(500);
            } else {
                monsterHealth.value -= attackValue;
                playSound(hitSound);
                addLogMessage('Hiciste ' + attackValue + ' pts de daño!');
                monsterBlinking.value = true;
                await delay(500);
                monsterBlinking.value = false;
            }

            if (monsterHealth.value > 0){
                await attackPlayer();
            } else {
                addLogMessage(currentMonster.value.name + ' ha muerto')
            }

            if(attackValue > 0){
                if((playerMana.value + 1) > maxPlayerMana.value){
                    playerMana.value = maxPlayerMana.value;
                } else {
                    playerMana.value++;
                }
            }

            isActionInProgress.value = false;
        };

        /*--- Patrones de ataque de Monstruo ---*/

        // Ataque sencillo
        const simpleAttackPattern = async(attack, defense) => {
            let attackValue = 0;
            if (defense >= attack){
                const minimumDamage = Math.floor((attack + 4) / 6);
                attackValue = Math.floor(Math.random() * minimumDamage+1);
            } else {
                attackValue = calculateAttackDamage(
                attack, defense);
            }

            playSound(enemyAttackSound);
            addLogMessage(currentMonster.value.name + ' te ataca!');
            await delay(500);
            
            if(attackValue === 0){
                playSound(missSound2);
                addLogMessage('Pero falló!');
            } else {
                playerHealth.value -= attackValue;
                playSound(hitSound);
                addLogMessage('Recibes ' + attackValue + ' pts de daño!');
                playerShaking.value = true;
                await delay(500);
                playerShaking.value = false;
            }
        };

        const simpleSpellPattern = async() => {
            const attackValue = calcMonsterDamageSpellDamage('HURT');
            monsterCasting.value = true;
            playSound(spellSound);
            addLogMessage(currentMonster.value.name + ' lanzó una bola de fuego!');
            await delay(700);
            monsterCasting.value = false;

            playerHealth.value -= attackValue;
            playSound(fireSound);
            await delay(250);
            playSound(hitSound);
            addLogMessage('Recibes ' + attackValue + ' pts de daño!');

            playerShaking.value = true;
            await delay(700);
            playerShaking.value = false;
        };

        const simpleHealPattern = async() => {
            const healingValue = calcMonsterHealSpellValue('HEAL');
            monsterCasting.value = true;
            playSound(spellSound);
            addLogMessage(currentMonster.value.name + ' lanzó un hechizo curativo!');
            await(700);
            monsterCasting.value = false;

            monsterHealth.value += healingValue;
            playSound(healSound);
            await delay(250);
            addLogMessage(currentMonster.value.name + ' se ha curado!');
            await delay(450);
        }

        const spellOrAttackPattern = async(attack, defense) => {
            // 50/50 chance de atacar o lanzar HURT
            if(Math.random() < 0.5){
                await simpleSpellPattern();
            } else {
                await simpleAttackPattern(attack, defense);
            }
        };

        const spellAndMaybeAttack = async(attack, defense) => {
            // 75/25 chance de atacar o lanzar HURT
            if(Math.random() < 0.75){
                await simpleSpellPattern();
            } else {
                await simpleAttackPattern(attack, defense);
            }
        };

        const healHurtAttackPattern = async(attack, defense) => {
            // if hp < 25%
            if (monsterHealth.value < (maxMonsterHealth.value * 0.25)){
                // 25% chance of healing
                if(Math.random() < 0.25){
                    await simpleHealPattern();
                } else {
                    await spellOrAttackPattern();
                }
            } else {
                await spellOrAttackPattern();
            }
        }

        const attackPlayer = async () => {
            // Datos de ataque del monstruo
            let armorDefense = 0;
            let shieldDefense = 0;
            if(equipment.value.armor){
                armorDefense = equipment.value.armor.defense;
            }
            if(equipment.value.shield){
                shieldDefense = equipment.value.shield.defense;
            }
            const totalDefense = basePlayerDefense.value + armorDefense + shieldDefense;

            switch(currentMonster.value.attackPattern){
                // 50% cast fireball & 50% attack
                case 1:
                    await spellOrAttackPattern(baseMonsterAttack.value, totalDefense);
                    break;
                case 2:
                    await spellAndMaybeAttack(baseMonsterAttack.value, totalDefense);
                    break;
                case 3:
                    await healHurtAttackPattern(baseMonsterAttack.value, totalDefense);
                // Attack Only
                default:
                    await simpleAttackPattern(baseMonsterAttack.value, totalDefense);
                    break;
                break;
            }
        };

        const specialAttackMonster = async () => {
            logMessages.value = [];
            toggleSpellsMenu();
            if(isActionInProgress.value) return;
            isActionInProgress.value = true;

            currentRound.value++;
            const attackValue = calculateSpecialAttackDamage(playerMagicPower.value);
            const attackCost = 4;

            if(checkMana(attackCost)){
                playSound(spellSound);
                addLogMessage('Utilizas "Bola de Fuego" ' + currentMonster.value.name);
                await delay(500);

                playerMana.value -= attackCost;
                playSound(fireSound, 0.7);

                monsterHealth.value -= attackValue;
                playSound(hitSound);
                addLogMessage('Infliges ' + attackValue + ' pts de daño!');

                monsterBlinking.value = true;
                await delay(500);
                monsterBlinking.value = false;
                
                if (monsterHealth.value > 0){
                    await attackPlayer();
                }
            }

            isActionInProgress.value = false;
        };

        const applyHealing = async(healingValue, healingCost) => {
            playerHealing.value = true;
            if((playerHealth.value + healingValue) > maxPlayerHealth.value){
                playerHealth.value = maxPlayerHealth.value;
                playerMana.value -= healingCost;
                playSound(healSound)
                addLogMessage('Te recuperaste por completo!');
            } else if(playerHealth.value === maxPlayerHealth){
                addLogMessage('Pero no estabas herido!');
            } else {
                playerHealth.value += healingValue;
                playerMana.value -= healingCost;
                playSound(healSound)
                addLogMessage('Y recuperaste ' + healingValue + ' pts de salud!');
            }
            await delay(500);
            playerHealing.value = false;
        }

        const healPlayer = async () => {
            logMessages.value = [];
            toggleSpellsMenu();
            if(isActionInProgress.value) return;
            isActionInProgress.value = true;

            currentRound.value++;
            const healValue = healing('spell');
            const healCost = 3;

            if(checkMana(healCost)){
                playSound(spellSound)
                addLogMessage('Lanzaste "Curación"!')
                await delay(600);

                applyHealing(healValue, healCost);
                await delay(500);

                if (monsterHealth.value > 0){
                    await attackPlayer();
                }
            }

            isActionInProgress.value = false;
        };

        const toggleSpellsMenu = () => {
            showSpells.value = !showSpells.value;
        }

        const handleAttackButton = () => {
            attackMonster();
            playSound(menuSound, 0.7);
        }
        const handleSpellsButton = () => {
            toggleSpellsMenu();
            playSound(menuSound, 0.7);
        }
        const handleFleeButton = () => {
            flee();
            playSound(menuSound, 0.7);
        }
        const handleSpecialAttackB = () => {
            specialAttackMonster();
            playSound(menuSound, 0.7);
        }
        const handleHealButton = () => {
            healPlayer();
            playSound(menuSound, 0.7);
        }

        // Uso de Items
        const itemUse = async(item) => {
            
            switch(item.name){
                case 'herb':
                    const healingValue = healing();
                    addLogMessage('Usaste ' + item.name);
                    playSound(menuSound, 0.7);
                    await(500);

                    applyHealing(healingValue, 0);

                    break;
                // TODO: Agregar más items
            }
        }

        // Ganar experiencia
        const gainExperience = (exp) => {
            playerEXP.value += exp;
            addLogMessage('Haz ganado ' + exp + ' pts de EXP');
            console.log('player EXP: ' + playerEXP.value);

            // Verificar si subió de nivel
            checkLevelUp();
        };

        // Ganar oro
        const gainGold = (gold) => {
            playerGold.value += gold;
            addLogMessage('Haz ganado ' + gold + ' G');
            console.log('player Gold: ' + playerGold.value);
        };

        const checkLevelUp = () => {
            const nextLevel = playerLevel.value + 1;

            // Verificar si hay suficiente xp para subir de nievl
            if(expTable[nextLevel] && playerEXP.value >= expTable[nextLevel]){
                levelUp();
            } else {
                // Actualizar EXP para el siguiente nivel
                expToNextLevel.value = expTable[nextLevel] - playerEXP.value;
                console.log('EXP for next level: ' + expToNextLevel.value);
            }
        };

        const levelUp = async () => {
            const oldLevel = playerLevel.value;
            playerLevel.value ++;

            // Mejorar las estadísticas del jugador
            const healthPlus = 3 + Math.floor(Math.random() * 3); // +3 - 5 HP
            const attackPlus = 1 + Math.floor(Math.random() * 4); // +1 - 3 ATK
            const defensePlus = Math.floor(Math.random() * 4); // +0 - 3 DEF
            const manaPlus = 1 + Math.floor(Math.random() * 4); // +1 - 3 MP

            maxPlayerHealth.value += healthPlus;
            basePlayerAttack.value += attackPlus;
            basePlayerDefense.value += defensePlus;
            maxPlayerMana.value += manaPlus;
            playerMagicPower.value += manaPlus;
            
            // Restaurar HP y MP completamente al subir de nivel
            playerHealth.value = maxPlayerHealth.value;
            playerMana.value = maxPlayerMana.value;

            // Calcular EXP para el siguiente nivel
            const nextLevel = playerLevel.value + 1;
            expToNextLevel.value = expTable[nextLevel] ? expTable[nextLevel] - playerEXP.value : 0;

            // Mensaje de log
            levelingUp.value = true;
            playSound(levelupSound, 0.8);
            await delay(2000);
            addLogMessage('Has subido al nivel ' + playerLevel.value +'!');
            await delay(500);
            addLogMessage('Salud aumentó ' + healthPlus + ' pts');
            await delay(250);
            addLogMessage('Ataque aumentó ' + attackPlus + ' pts');
            await delay(250);
            if(defensePlus > 0) {addLogMessage('Defensa aumentó ' + defensePlus + ' pts');}
            await delay(250);
            addLogMessage('Mana aumentó ' + manaPlus + ' pts');
            
            // Verificar si puede subir otro nivel (por si ganó mucha EXP)
            checkLevelUp();
            levelingUp.value = false;
        };

        const defeatMonster = async () => {
            // Mensaje de victoria
            addLogMessage('Haz derrotado a ' + currentMonster.value.name + '!');

            // Ganar experiencia
            gainExperience(monsterXP.value);
            gainGold(monsterGold.value);
            
            // Pequeña pausa antes de mostrar el mensaje de continuación
            await delay(1000);
        };

        const checkMana = (manaRequired) => {
            return playerMana.value >= manaRequired;
        };

        const flee = () => {
            winner.value = 'flee';
            stopMusic();
            playSound(fleeSound, 0.6);
        };

        const startNewGame = () => {
            // TODO: Cargar Partida
            defeatSound.value.pause();
            playBattleMusics();
            playerHealth.value = maxPlayerHealth.value;
            monsterHealth.value = maxMonsterHealth.value;
            playerMana.value = maxPlayerMana.value;
            winner.value = null;
            currentRound = 0;
            logMessages = [];
        };

        const addLogMessage = (message) => {
            logMessages.value.push(message);
        };

        const startBattle = (monsterType) => {
            transitionActive.value = true;
            
            setTimeout(() => {
                mode.value = 'battle';
                encounterActive.value = false;

                // Configurar el monstruo según su tipo
                let monsterConfig;
                switch(monsterType){
                    case 'red-slime':
                        monsterConfig = {
                            name: 'Slime Rojo',
                            level: 1,
                            imgPath: './assets/sprites/enemies/Red-Slime.png',
                            attackPatter: 0
                        };
                        baseMonsterAttack.value = 7;
                        maxMonsterHealth.value = 4;
                        baseMonsterDefense.value = 3;
                        monsterXP.value = 3;
                        monsterGold.value = 4;
                        monsterHealth.value = maxMonsterHealth.value;
                        break;
                    case 'drakee':
                        monsterConfig = {
                            name: 'Drakee',
                            level: 2,
                            imgPath: './assets/sprites/enemies/Drakee.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 9;
                        maxMonsterHealth.value = getRandomInteger(5,6);
                        baseMonsterDefense.value = 6;
                        monsterXP.value = 4;
                        monsterGold.value = 4;
                        monsterHealth.value = maxMonsterHealth.value;
                        break;
                    case 'ghost':
                        monsterConfig = {
                            name: 'Fantasma',
                            level: 2,
                            imgPath: './assets/sprites/enemies/Ghost.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 11;
                        maxMonsterHealth.value = getRandomInteger(6,7);
                        baseMonsterDefense.value = 8;
                        monsterXP.value = 6;
                        monsterGold.value = getRandomInteger(6,8);
                        monsterHealth.value = maxMonsterHealth.value;
                        break;
                    case 'magician':
                        monsterConfig = {
                            name: 'Hechicero',
                            level: 3,
                            imgPath: './assets/sprites/enemies/Magician.png',
                            attackPattern: 1
                        };
                        baseMonsterAttack.value = 11;
                        maxMonsterHealth.value = getRandomInteger(10,13);
                        baseMonsterDefense.value = 12;
                        monsterXP.value = 8;
                        monsterGold.value = getRandomInteger(18,22);
                        monsterHealth.value = maxMonsterHealth.value;
                        break;
                    case 'magidrakee':
                        monsterConfig = {
                            name: 'Magidrakee',
                            level: 3,
                            imgPath: './assets/sprites/enemies/Magidrakee.png',
                            attackPattern: 1
                        };
                        baseMonsterAttack.value = 14;
                        maxMonsterHealth.value = getRandomInteger(12,15);
                        baseMonsterDefense.value = 14;
                        monsterXP.value = 10;
                        monsterGold.value = getRandomInteger(18,22);
                        monsterHealth.value = maxMonsterHealth.value;
                        break;
                    case 'scorpion':
                        monsterConfig = {
                            name: 'Escorpion',
                            level: 4,
                            imgPath: './assets/sprites/enemies/Scorpion.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 18;
                        maxMonsterHealth.value = getRandomInteger(16,20);
                        baseMonsterDefense.value = 16;
                        monsterXP.value = 12;
                        monsterGold.value = getRandomInteger(24,30);
                        monsterHealth.value = maxMonsterHealth.value;
                        break;
                    case 'druin':
                        monsterConfig = {
                            name: 'Lunatick',
                            level: 4,
                            imgPath: './assets/sprites/enemies/Druin.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 20;
                        maxMonsterHealth.value = getRandomInteger(17,22);
                        baseMonsterDefense.value = 18;
                        monsterXP.value = 14;
                        monsterGold.value = getRandomInteger(24,30);
                        monsterHealth.value = maxMonsterHealth.value;
                        break;
                    case 'poltergeist':
                        monsterConfig = {
                            name: 'Poltergeist',
                            level: 4,
                            imgPath: './assets/sprites/enemies/Poltergeist.png',
                            attackPattern: 2
                        };
                        baseMonsterAttack.value = 18;
                        maxMonsterHealth.value = getRandomInteger(18,23);
                        baseMonsterDefense.value = 20;
                        monsterXP.value = 16;
                        monsterGold.value = getRandomInteger(26,34);
                        monsterHealth.value = maxMonsterHealth.value;
                        break;
                    case 'droll':
                        monsterConfig = {
                            name: 'Babosidad',
                            level: 4,
                            imgPath: './assets/sprites/enemies/Droll.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 24;
                        maxMonsterHealth.value = getRandomInteger(19,25);
                        baseMonsterDefense.value = 24;
                        monsterXP.value = 20;
                        monsterGold.value = getRandomInteger(36,48);
                        monsterHealth.value = maxMonsterHealth.value;
                        break;
                    case 'drakeema':
                        monsterConfig = {
                            name: 'Drakeema',
                            level: 4,
                            imgPath: './assets/sprites/enemies/Drakeema.png',
                            attackPattern: 3
                        };
                        baseMonsterAttack.value = 22;
                        maxMonsterHealth.value = getRandomInteger(16,20);
                        baseMonsterDefense.value = 26;
                        monsterXP.value = 22;
                        monsterGold.value = getRandomInteger(30,38);
                        monsterHealth.value = maxMonsterHealth.value;
                        break;
                    case 'skeleton':
                        monsterConfig = {
                            name: 'Esqueleto',
                            level: 5,
                            imgPath: './assets/sprites/enemies/Skeleton.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 28;
                        maxMonsterHealth.value = getRandomInteger(23,30);
                        baseMonsterDefense.value = 22;
                        monsterXP.value = 24;
                        monsterGold.value = getRandomInteger(44,58);
                        monsterHealth.value = maxMonsterHealth.value;
                        break;
                    case 'warlock':
                        monsterConfig = {
                            name: 'Ilusionista',
                            level: 5,
                            imgPath: './assets/sprites/enemies/Warlock.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 28;
                        maxMonsterHealth.value = getRandomInteger(23,30);
                        baseMonsterDefense.value = 22;
                        monsterXP.value = 26;
                        monsterGold.value = getRandomInteger(52,68);
                        monsterHealth.value = maxMonsterHealth.value;
                        break;
                    case 'metal-scorpion':
                        monsterConfig = {
                            name: 'Escorpión Metálico',
                            level: 6,
                            imgPath: './assets/sprites/enemies/Metal-Scorpion.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 36;
                        maxMonsterHealth.value = getRandomInteger(17,22);
                        baseMonsterDefense.value = 42;
                        monsterXP.value = 28;
                        monsterGold.value = getRandomInteger(60,78);
                        monsterHealth.value = maxMonsterHealth.value;
                        break;
                    case 'wolf':
                        monsterConfig = {
                            name: 'Lobo',
                            level: 6,
                            imgPath: './assets/sprites/enemies/Wolf.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 40;
                        maxMonsterHealth.value = getRandomInteger(26,34);
                        baseMonsterDefense.value = 30;
                        monsterXP.value = 32;
                        monsterGold.value = getRandomInteger(74,98);
                        monsterHealth.value = maxMonsterHealth.value;
                        break;
                    case 'wraith':
                        monsterConfig = {
                            name: 'Asesino Óseo',
                            level: 7,
                            imgPath: './assets/sprites/enemies/Wraith.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 44;
                        baseMonsterDefense.value = 34;
                        maxMonsterHealth.value = getRandomInteger(28,36);
                        monsterXP.value = 34;
                        monsterGold.value = getRandomInteger(90,118);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'metal-slime':
                        monsterConfig = {
                            name: 'Slime Metálico',
                            level: 7,
                            imgPath: './assets/sprites/enemies/Metal-Slime.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 10;
                        baseMonsterDefense.value = 255;
                        maxMonsterHealth.value = 4;
                        monsterXP.value = 255;
                        monsterGold.value = getRandomInteger(8,10);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'specter':
                        monsterConfig = {
                            name: 'Espectro',
                            level: 7,
                            imgPath: './assets/sprites/enemies/Specter.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 40;
                        baseMonsterDefense.value = 38;
                        maxMonsterHealth.value = getRandomInteger(28,36);
                        monsterXP.value = 36;
                        monsterGold.value = getRandomInteger(104,138);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'wolflord':
                        monsterConfig = {
                            name: 'Lobo Alfa',
                            level: 8,
                            imgPath: './assets/sprites/enemies/Wolflord.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 50;
                        baseMonsterDefense.value = 36;
                        maxMonsterHealth.value = getRandomInteger(29,38);
                        monsterXP.value = 40;
                        monsterGold.value = getRandomInteger(120,158);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'druinlord':
                        monsterConfig = {
                            name: 'Lunatick Delirante',
                            level: 8,
                            imgPath: './assets/sprites/enemies/Druinlord.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 47;
                        baseMonsterDefense.value = 40;
                        maxMonsterHealth.value = getRandomInteger(27,35);
                        monsterXP.value = 40;
                        monsterGold.value = getRandomInteger(126,168);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'drollmagi':
                        monsterConfig = {
                            name: 'Babosidad Diabolista',
                            level: 8,
                            imgPath: './assets/sprites/enemies/Droll-Magi.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 52;
                        baseMonsterDefense.value = 50;
                        maxMonsterHealth.value = getRandomInteger(29,38);
                        monsterXP.value = 44;
                        monsterGold.value = getRandomInteger(134,178);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'wyvern':
                        monsterConfig = {
                            name: 'Quimera',
                            level: 8,
                            imgPath: './assets/sprites/enemies/Wyvern.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 56;
                        baseMonsterDefense.value = 48;
                        maxMonsterHealth.value = getRandomInteger(32,42);
                        monsterXP.value = 48;
                        monsterGold.value = getRandomInteger(150,198);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'rogue-scorpion':
                        monsterConfig = {
                            name: 'Escorpión Mortífero',
                            level: 9,
                            imgPath: './assets/sprites/enemies/Rogue-Scorpion.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 60;
                        baseMonsterDefense.value = 90;
                        maxMonsterHealth.value = getRandomInteger(27,35);
                        monsterXP.value = 52;
                        monsterGold.value = getRandomInteger(164,218);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'wraith-knight':
                        monsterConfig = {
                            name: 'Soldado Esqueleto',
                            level: 9,
                            imgPath: './assets/sprites/enemies/Wraith-Knight.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 68;
                        baseMonsterDefense.value = 56;
                        maxMonsterHealth.value = getRandomInteger(35,46);
                        monsterXP.value = 56;
                        monsterGold.value = getRandomInteger(180,238);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'golem':
                        monsterConfig = {
                            name: 'Golem',
                            level: 11,
                            imgPath: './assets/sprites/enemies/Golem.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 120;
                        baseMonsterDefense.value = 60;
                        maxMonsterHealth.value = getRandomInteger(53,70);
                        monsterXP.value = 90;
                        monsterGold.value = getRandomInteger(14,18);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'goldman':
                        monsterConfig = {
                            name: 'Golem de Oro',
                            level: 9,
                            imgPath: './assets/sprites/enemies/Goldman.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 48;
                        baseMonsterDefense.value = 40;
                        maxMonsterHealth.value = getRandomInteger(38,50);
                        monsterXP.value = 6;
                        monsterGold.value = getRandomInteger(300,398);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'knight':
                        monsterConfig = {
                            name: 'Caballero Errante',
                            level: 10,
                            imgPath: './assets/sprites/enemies/Knight.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 76;
                        baseMonsterDefense.value = 78;
                        maxMonsterHealth.value = getRandomInteger(42,55);
                        monsterXP.value = 66;
                        monsterGold.value = getRandomInteger(194,258);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'magiwyvern':
                        monsterConfig = {
                            name: 'Quimera Mágica',
                            level: 10,
                            imgPath: './assets/sprites/enemies/Magiwyvern.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 78;
                        baseMonsterDefense.value = 68;
                        maxMonsterHealth.value = getRandomInteger(44,58);
                        monsterXP.value = 68;
                        monsterGold.value = getRandomInteger(210,278);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'demon-knight':
                        monsterConfig = {
                            name: 'Esqueleto Tenebroso',
                            level: 10,
                            imgPath: './assets/sprites/enemies/Demon-Knight.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 79;
                        baseMonsterDefense.value = 64;
                        maxMonsterHealth.value = getRandomInteger(38,50);
                        monsterXP.value = 74;
                        monsterGold.value = getRandomInteger(224,298);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'werewolf':
                        monsterConfig = {
                            name: 'Hombre Lobo',
                            level: 11,
                            imgPath: './assets/sprites/enemies/Werewolf.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 86;
                        baseMonsterDefense.value = 70;
                        maxMonsterHealth.value = getRandomInteger(46,60);
                        monsterXP.value = 80;
                        monsterGold.value = getRandomInteger(232,308);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'green-dragon':
                        monsterConfig = {
                            name: 'Dragón Verde',
                            level: 11,
                            imgPath: './assets/sprites/enemies/Green-Dragon.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 88;
                        baseMonsterDefense.value = 74;
                        maxMonsterHealth.value = getRandomInteger(49,65);
                        monsterXP.value = 90;
                        monsterGold.value = getRandomInteger(240,318);
                        monsterHealth.value = maxMonsterHealth.value;
                        break;
                    case 'starwyvern':
                        monsterConfig = {
                            name: 'Quimera Cósmica',
                            level: 11,
                            imgPath: './assets/sprites/enemies/Star-Wyvern.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 86;
                        baseMonsterDefense.value = 80;
                        maxMonsterHealth.value = getRandomInteger(49,65);
                        monsterXP.value = 86;
                        monsterGold.value = getRandomInteger(240,318);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'wizard':
                        monsterConfig = {
                            name: 'Archimago',
                            level: 11,
                            imgPath: './assets/sprites/enemies/Wizard.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 80;
                        baseMonsterDefense.value = 70;
                        maxMonsterHealth.value = getRandomInteger(49,65);
                        monsterXP.value = 100;
                        monsterGold.value = getRandomInteger(246,328);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'axe-knight':
                        monsterConfig = {
                            name: 'Caballero Aberrante',
                            level: 12,
                            imgPath: './assets/sprites/enemies/Axe-Knight.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 94;
                        baseMonsterDefense.value = 82;
                        maxMonsterHealth.value = getRandomInteger(53,70);
                        monsterXP.value = 108;
                        monsterGold.value = getRandomInteger(246,328);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'blue-dragon':
                        monsterConfig = {
                            name: 'Dragón Azul',
                            level: 12,
                            imgPath: './assets/sprites/enemies/Blue-Dragon.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 98;
                        baseMonsterDefense.value = 84;
                        maxMonsterHealth.value = getRandomInteger(53,70);
                        monsterXP.value = 120;
                        monsterGold.value = getRandomInteger(224,298);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'stoneman':
                        monsterConfig = {
                            name: 'Golem de Piedra',
                            level: 12,
                            imgPath: './assets/sprites/enemies/Stoneman.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 100;
                        baseMonsterDefense.value = 40;
                        maxMonsterHealth.value = getRandomInteger(121,161);
                        monsterXP.value = 130;
                        monsterGold.value = getRandomInteger(210,278);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'armored-knight':
                        monsterConfig = {
                            name: 'Caballero Aborrecible',
                            level: 13,
                            imgPath: './assets/sprites/enemies/Armored-Knight.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 105;
                        baseMonsterDefense.value = 86;
                        maxMonsterHealth.value = getRandomInteger(68,90);
                        monsterXP.value = 140;
                        monsterGold.value = getRandomInteger(210,278);
                        monsterHealth.value = maxMonsterHealth.value;
                    case 'red-dragon':
                        monsterConfig = {
                            name: 'Dragón Rojo',
                            level: 13,
                            imgPath: './assets/sprites/enemies/Red-Dragon.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 120;
                        baseMonsterDefense.value = 90;
                        maxMonsterHealth.value = getRandomInteger(76,100);
                        monsterXP.value = 200;
                        monsterGold.value = getRandomInteger(210,278);
                        monsterHealth.value = maxMonsterHealth.value;
                    default: // slime
                        monsterConfig = {
                            name: 'Slime',
                            level: 1,
                            imgPath: './assets/sprites/enemies/Slime.png',
                            attackPattern: 0
                        };
                        baseMonsterAttack.value = 5;
                        maxMonsterHealth.value = 3;
                        baseMonsterDefense.value = 2;
                        monsterXP.value = 2;
                        monsterGold.value = 2;
                        monsterHealth.value = maxMonsterHealth.value;
                }
                currentMonster.value = monsterConfig;

                // Reiniciar estado de batalla
                winner.value = null;
                logMessages.value = [];

                addLogMessage(currentMonster.value.name + ' apareció!');
                
                setTimeout(() => {
                    transitionActive.value = false;
                }, 500);
            }, 500);
        };

        const returnToExploration = () => {
            transitionActive.value = true;
            
            setTimeout(() => {
                mode.value = 'exploration';
                
                healAB = Math.floor(maxPlayerHealth.value*0.1);
                manaAB = Math.floor(maxPlayerMana.value*0.1);

                // Restaurar salud y maná después de la batalla
                // if ((playerHealth.value + healAB) < maxPlayerHealth.value){
                //     playerHealth.value += healAB;
                // } else {
                //     playerHealth.value = maxPlayerHealth.value;
                // }
                // if ((playerMana.value + manaAB) < maxPlayerMana.value){
                //     playerMana.value += manaAB;
                // } else {
                //     playerMana.value = maxPlayerMana.value;
                // }
                
                setTimeout(() => {
                    transitionActive.value = false;
                }, 500);
            }, 500);
        };

        const handleReturnButton = () => {
            returnToExploration();
            playSound(menuSound, 0.7);
        }

        // Métodos de sonido
        const stopMusic = () => {
            const allMusic = [
                backgroundMusic,
                battleMusic,
                battleMusic1,
                battleMusicStart1,
                battleMusic2,
                battleMusicStart2,
                battleMusic3
            ];
            allMusic.forEach(audioRef => {
                if(audioRef.value){
                    audioRef.value.pause();
                    audioRef.value.currentTime = 0;
                }
            });
        };

        const playMusic = async(audioRef, volume = 0.4) => {
            if (!musicEnabled.value) return;
            
            // Detener toda la música primero
            stopMusic();
            
            // Reproducir la música solicitada
            audioRef.value.volume = volume;
            audioRef.value.currentTime = 0;
            try {
                await audioRef.value.play();
            } catch (e) {
                console.log("Audio error:", e);
            }
        };

        const playBattleMusic1 = async() => {
            if (!musicEnabled.value) return;

            stopMusic();

            await playMusic(battleMusicStart1);

            battleMusicStart1.value.onended = async() => {
                if(musicEnabled.value){
                    await playMusic(battleMusic1);
                }
            };

            if (battleMusicStart1.value.ended) {
                await playMusic(battleMusic1);
            }
        }

        const playBattleMusic2 = async() => {
            if (!musicEnabled.value) return;

            stopMusic();

            await playMusic(battleMusicStart2, 0.6);

            battleMusicStart2.value.onended = async() => {
                if(musicEnabled.value){
                    await playMusic(battleMusic2, 0.6);
                }
            };

            if (battleMusicStart2.value.ended) {
                await playMusic(battleMusic2);
            }
        }
        
        const playSound = (audioRef, volume = 1.0) => {
            if (!sfxEnabled.value) return;
            
            audioRef.value.volume = volume;
            audioRef.value.currentTime = 0;
            audioRef.value.play().catch(e => console.log("SFX error:", e));
        };
        
        playBattleMusics = () => {
            if(!musicEnabled.value) return;

            stopMusic();

            if (currentMonster.value.level > 8){
                playMusic(battleMusic3);
            } else if (currentMonster.value.level > 4){
                playBattleMusic2();
            } else {
                playBattleMusic1();
            }
        }

        const toggleMusic = () => {
            musicEnabled.value = !musicEnabled.value;
            playSound(menuSound, 0.7);
            
            if (musicEnabled.value) {
                if (mode.value === 'exploration') {
                    playMusic(backgroundMusic);
                } else {
                    playBattleMusics();
                }
            } else {
                stopMusic();
            }
        };
        
        const toggleSfx = () => {
            sfxEnabled.value = !sfxEnabled.value;
            playSound(menuSound, 0.7);
        };

        const toggleZoom = () => {
            playSound(menuSound, 0.7);
            if(ZOOM_LEVEL.value === 2){
                ZOOM_LEVEL.value = 1;
            } else if (ZOOM_LEVEL.value === 1.5){
                ZOOM_LEVEL.value = 2; 
            } else {
                ZOOM_LEVEL.value = 1.5;
            }
        };

        // Inicialización
        onMounted(() => {
            worldMap.value = generateWorldMap();
            
            // Enfocar el mapa para capturar eventos de teclado
            document.getElementById('world-map').focus();
            
            // Iniciar música de fondo
            setTimeout(() => {
                if (musicEnabled.value) {
                    playMusic(backgroundMusic);
                }
            }, 1000);

            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
            // Iniciar bucle del juego
            gameLoop(0);
        });

        onUnmounted(() => {
            // Limpieza para evitar fugas de memoria
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if(animationFrameId){
                cancelAnimationFrame(animationFrameId);
            }
        });

        return {
            ZOOM_LEVEL,

            // Estados y propiedades computadas
            mode,
            transitionActive,
            isActionInProgress,
            playerTile,
            playerDirection,
            camera,
            worldMap,
            visibleTiles,
            getTotalAttack,
            getTotalDefense,
            mapGridStyle,
            currentEncounterTerrain,
            playerStyle,
            miniMapPlayerStyle,
            currentZone,
            inventory,
            activeMenu,
            showSpells,
            keysPressed,

            // Datos del juego

            playerLevel,
            playerHealth,
            maxPlayerHealth,
            basePlayerAttack,
            basePlayerDefense,
            playerMana,
            maxPlayerMana,
            playerEXP,
            playerGold,
            expToNextLevel,
            equipment,
            monsterHealth,
            winner,
            logMessages,
            currentMonster,
            musicEnabled,
            sfxEnabled,
            levelingUp,

            // Estados de animación
            monsterBlinking,
            monsterCasting,
            playerShaking,
            playerHealing,
            
            // Referencias de audio
            backgroundMusic,
            battleMusic,
            battleMusic1,
            battleMusic2,
            battleMusic3,
            battleMusicStart1,
            battleMusicStart2,
            playerAttackSound,
            enemyAttackSound,
            spellSound,
            hitSound,
            fireSound,
            missSound1,
            missSound2,
            criticalHitSound,
            healSound,
            victorySound,
            levelupSound,
            defeatSound,
            fleeSound,
            menuSound,
            
            // Computed
            monsterHealthBarStyles,
            playerHealthBarStyles,
            playerManaBarStyles,
            battleBackgroundStyle,
            criticalText,
            
            // Métodos
            equipItem,
            itemUse,
            handleAttackButton,
            handleSpellsButton,
            handleFleeButton,
            handleSpecialAttackB,
            handleHealButton,
            handleReturnButton,
            attackMonster,
            specialAttackMonster,
            healPlayer,
            gainExperience,
            gainGold,
            checkLevelUp,
            levelUp,
            defeatMonster,
            flee,
            startNewGame,
            checkMana,
            toggleSpellsMenu,
            returnToExploration,
            toggleMusic,
            toggleSfx,
            toggleZoom,
            playSound,
            handleKeyDown,
            handleKeyUp,
            movePlayer,
            gameLoop,
            getTileClass,
            getTileStyle,
            checkMonsterEncounter,
            startBattle,
            toggleMainMenu,
            openSubMenu,
        };
    }
});

app.mount('#game')
