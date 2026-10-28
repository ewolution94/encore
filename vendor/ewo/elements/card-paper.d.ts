export interface GrainOptions {
    /** The tile's size in px (160). */
    size?: number;
    /** The lightest and darkest grey of the noise (255, 205). */
    light?: number;
    dark?: number;
    /** The custom property set on <html>, or null for none ('--grain'). */
    property?: string | null;
}
export declare function paperGrain(options?: GrainOptions): string;
