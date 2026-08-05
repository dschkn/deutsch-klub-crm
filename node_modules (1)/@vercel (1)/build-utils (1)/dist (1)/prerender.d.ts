import type { File, HasField, Chain } from './types';
import { Lambda } from './lambda';
interface PrerenderOptions {
    expiration: number | false;
    staleExpiration?: number;
    lambda?: Lambda;
    fallback: File | null;
    group?: number;
    bypassToken?: string | null;
    allowQuery?: string[];
    allowHeader?: string[];
    initialHeaders?: Record<string, string>;
    initialStatus?: number;
    passQuery?: boolean;
    sourcePath?: string;
    experimentalBypassFor?: HasField;
    experimentalStreamingLambdaPath?: string;
    chain?: Chain;
    exposeErrBody?: boolean;
    partialFallback?: boolean;
    hasPostponed?: boolean;
    hasFallback?: boolean;
    htmlSize?: number;
    isDynamicRoute?: boolean;
}
export declare class Prerender {
    type: 'Prerender';
    /**
     * `expiration` is `revalidate` in Next.js terms, and `s-maxage` in
     * `cache-control` terms.
     */
    expiration: number | false;
    /**
     * `staleExpiration` is `expire` in Next.js terms, and
     * `stale-while-revalidate` + `s-maxage` in `cache-control` terms. It's
     * expected to be undefined if `expiration` is `false`.
     */
    staleExpiration?: number;
    lambda?: Lambda;
    fallback: File | null;
    group?: number;
    bypassToken: string | null;
    allowQuery?: string[];
    allowHeader?: string[];
    initialHeaders?: Record<string, string>;
    initialStatus?: number;
    passQuery?: boolean;
    sourcePath?: string;
    experimentalBypassFor?: HasField;
    experimentalStreamingLambdaPath?: string;
    chain?: Chain;
    exposeErrBody?: boolean;
    partialFallback?: boolean;
    /**
     * Set to `true` when the route's `.meta` postponed state is present (React
     * suspended during build prerender). `false` when the framework prerendered
     * a Prerender route without postponing. `undefined` when the framework did
     * not provide the signal.
     */
    hasPostponed?: boolean;
    /**
     * `true` when the route's dynamic template had a static fallback page (the
     * prerender-manifest `fallback` was a string). `false` for blocking/omitted
     * dynamic templates (manifest `fallback` was `null`/`false`). `undefined` for
     * concrete prerenders, where the notion of a fallback doesn't apply.
     */
    hasFallback?: boolean;
    /**
     * Byte size on disk of the route's prerendered `.html` shell. `0` for an
     * empty shell (PPR template that postponed everything). `undefined` when
     * there's no `.html` on disk (pages router, route handlers, edge).
     */
    htmlSize?: number;
    /**
     * `true` when this entry came from a dynamic route template (the
     * prerender-manifest `dynamicRoutes` section: fallback, blocking, or omitted)
     * rather than a concrete prerender.
     */
    isDynamicRoute?: boolean;
    constructor({ expiration, staleExpiration, lambda, fallback, group, bypassToken, allowQuery, allowHeader, initialHeaders, initialStatus, passQuery, sourcePath, experimentalBypassFor, experimentalStreamingLambdaPath, chain, exposeErrBody, partialFallback, hasPostponed, hasFallback, htmlSize, isDynamicRoute, }: PrerenderOptions);
}
export {};
