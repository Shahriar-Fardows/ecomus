// Utility functions for cart management
export const getCartFromStorage = () => {
  if (typeof window !== "undefined") {
    const cart = localStorage.getItem("cart")
    return cart ? JSON.parse(cart) : []
  }
  return []
}

export const saveCartToStorage = (cart) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(cart))
  }
}

export const addToCart = (product, quantity = 1, selectedColor = null, selectedSize = null) => {
  const cart = getCartFromStorage()
  const existingItem = cart.find(
    (item) => item._id === product._id && item.selectedColor === selectedColor && item.selectedSize === selectedSize,
  )

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({
      _id: product._id,
      title: product.title,
      price: product.price,
      currency: product.currency,
      image: product.mainImages?.[0]?.url || "",
      quantity,
      selectedColor,
      selectedSize,
    })
  }

  saveCartToStorage(cart)
  return cart
}

export const removeFromCart = (productId, selectedColor = null, selectedSize = null) => {
  const cart = getCartFromStorage()
  const updatedCart = cart.filter(
    (item) => !(item._id === productId && item.selectedColor === selectedColor && item.selectedSize === selectedSize),
  )
  saveCartToStorage(updatedCart)
  return updatedCart
}

export const updateCartQuantity = (productId, quantity, selectedColor = null, selectedSize = null) => {
  const cart = getCartFromStorage()
  const item = cart.find(
    (item) => item._id === productId && item.selectedColor === selectedColor && item.selectedSize === selectedSize,
  )

  if (item) {
    item.quantity = quantity
    saveCartToStorage(cart)
  }
  return cart
}
