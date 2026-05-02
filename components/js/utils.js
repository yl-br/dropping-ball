// components/js/utils.js

// ADD 'export' before the function[cite: 11]
export function getFirstIntersection(arr1, arr2) {
    const set2 = new Set(arr2);
    return arr1.find(item => set2.has(item)) || null;
}