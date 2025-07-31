# Arrays

There are a number of functions designed to make working with arrays easier. They largely mimic similar functions found in core Python or the `numpy` library.

## Functions

- `zip(...arrs)` — combine arrays `arrs` element-wise
- `min(...arrs)` — the minimum of arrays `arrs`
- `max(...arrs)` — the maximum of arrays `arrs`
- `reshape(arr, shape)` — reshape array `arr` to given dimensions `shape`
- `split(arr, len)` — split array `arr` into subarrays of length `len`
- `sum(arr)` — sum the elements of array `arr`
- `all(arr)` — check if all elements of array `arr` are true
- `any(arr)` — check if any element of array `arr` is true
- `add(arr1, arr2)` — add arrays `arr1` and `arr2` element-wise
- `mul(arr1, arr2)` — multiply arrays `arr1` and `arr2` element-wise
- `cumsum(arr, first=true)` — compute the cumulative sum of array `arr` with the option to start at zero
- `norm(arr, degree=1)` — compute the `degree`-norm of array `arr`
- `normalize(arr, degree=1)` — normalize array `arr` to have `degree`-norm one
- `range(i0, i1, step=1)` — generate an array of evenly spaced values from `i0` to `i1` with spacing `step`
- `linspace(x0, x1, n=50)` — generate an array of `n` evenly spaced values between `x0` and `x1`
- `enumerate(arr)` — pair each element of array `arr` with its index
- `repeat(x, n)` — repeat array `x` a total of `n` times
- `meshgrid(x, y)` — create a mesh grid from arrays `x` and `y`
- `lingrid(xlim, ylim, N)` — create a 2D grid of `N = [Nx, Ny]` points over the ranges `xlim` and `ylim`
