def filter_products(products, unsafe_ingredients):

    safe_products = []

    for product in products:

        ingredients = product.get("ingredients", [])

        if not any(i in unsafe_ingredients for i in ingredients):

            safe_products.append(product)

    return safe_products