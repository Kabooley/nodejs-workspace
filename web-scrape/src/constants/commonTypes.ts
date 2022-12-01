/**
 * iOptional<> makes all properties in the passed type optional.
 * 
 * Quick test:
 * ```
 * interface iCollectOptions {
 *  keyword: string;    // This property is required.
 *  ...others are optional
 * }
 * type iOptionalCollectOptions = iOptionals<iCollectOptions>;
 * const dummy: iOptionalCollectOptions = {
 *  // keyword: "COWBOYBEBOP",      // This won't be error.
 * tags: ["cool", "awesome"],
 * userName: "Ed",
 * bookmarkOver: 1000
 * };
 * ```
 * */ 
export type iOptionals<Type> = {
    [Property in keyof Type]?: Type[Property];
};