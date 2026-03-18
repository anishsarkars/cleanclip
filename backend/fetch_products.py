import asyncio
from dodopayments import AsyncDodoPayments

DODO_API_KEY = "bHf0QJ_S32sZ60HT.mvKgz3EC7lwCgO9Ayy4gk6_0OodRae6VThSIGxOFWtKKCMs8"

async def main():
    client = AsyncDodoPayments(bearer_token=DODO_API_KEY)
    response = await client.products.list()
    with open("products.json", "w", encoding="utf-8") as f:
        f.write("[\n")
        for product in response.items:
            f.write(f'  {{"name": "{product.name}", "id": "{product.product_id}"}},\n')
        f.write("]\n")

if __name__ == "__main__":
    asyncio.run(main())
