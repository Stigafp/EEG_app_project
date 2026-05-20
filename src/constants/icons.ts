import type { ImageSourcePropType } from "react-native";
import type { DailyAnalysisMood} from "../utils/buildDailyAnalysis";

export type MoodIconConfig = {
    image: ImageSourcePropType;
    label: string;
    accessibilityLabel: string;
}

const MOOD_ICONS: Record<DailyAnalysisMood, MoodIconConfig> = {
    good: {
        image: require("../../assets/moodIcons/topOfTheWorld.png"),
        label: "Stabil",
        accessibilityLabel: "Stabilt humør ikon",
    },

    calm: {
        image: require("../../assets/moodIcons/calm.png"),
        label: "Rolig",
        accessibilityLabel: "Roligt humør ikon",
    },

    // relaxed: {
    //     image: require("../../assets/moodIcons/relaxed.png"),
    //     label: "Afslappet",
    //     accessibilityLabel: "Afslappet humør ikon",
    // },

    // sad: {
    //     image: require("../../assets/moodIcons/sad.png"),
    //     label: "Trist",
    //     accessibilityLabel: "Trist humør ikon",
    // },

    // excited: {
    //     image: require("../../assets/moodIcons/excited.png"),
    //     label: "Spændt",
    //     accessibilityLabel: "Spændt humør ikon",
    // },

    // stressed: {
    //     image: require("../../assets/moodIcons/stressed.png"),
    //     label: "Stresset",
    //     accessibilityLabel: "Stresset humør ikon",
    // },

    // hurt: {
    //     image: require("../../assets/moodIcons/hurt.png"),
    //     label: "Smerte",
    //     accessibilityLabel: "Smerte humør ikon",
    // },

    // loved: {
    //     image: require("../../assets/moodIcons/loved.png"),
    //     label: "Kærlighed",
    //     accessibilityLabel: "Kærlighed humør ikon",
    // },

    // angry: {
    //     image: require("../../assets/moodIcons/angry.png"),
    //     label: "Vred",
    //     accessibilityLabel: "Vredt humør ikon",
    // },

    // frustrated: {
    //     image: require("../../assets/moodIcons/frustrated.png"),
    //     label: "Frustréret",
    //     accessibilityLabel: "Frustréret humør ikon",
    // },

    // happy: {
    //     image: require("../../assets/moodIcons/happy.png"),
    //     label: "Glad",
    //     accessibilityLabel: "Glad humør ikon",
    // },

    tired: {
        image: require("../../assets/moodIcons/tired.png"),
        label: "Træt",
        accessibilityLabel: "Træt humør ikon",
    },

    // gjort til den samme som stressed icon, da det er den samme emoji
    strained: {
        image: require("../../assets/moodIcons/stressed.png"),
        label: "Stresset",
        accessibilityLabel: "Stresset humør ikon",
    },

    alert: {
        image: require("../../assets/moodIcons/alert.png"),
        label: "Opmærksom",
        accessibilityLabel: "Opmærksom humør ikon",
    },

    // fatigue: {
    //     image: require("../../assets/moodIcons/fatigue.png"),
    //     label: "Fatigue",
    //     accessibilityLabel: "Fatigue humør ikon",
    // }

};

export default MOOD_ICONS;
