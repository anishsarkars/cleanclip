
import os
import asyncio
from dodopayments import AsyncDodoPayments

async def main():
    api_key = "stdViNb9FSDs4HJY.jGSnNwTlGKRSiqhL3SowiHZgitf6PA5rMz9auKIMfWGfmdoM"
    client = AsyncDodoPayments(api_key=api_key)
    
    # Try listing products
    try:
        # Check available methods in client
        # Usually it's client.products.list() or similar.
        print("Checking for products...")
        # products = await client.products.list() # Might not exist exactly like this.
        # Let's try listing checkouts or similar if products is not available.
        # DodoPayments docs say 'checkouts', 'payments', 'subscriptions', 'customers'
        # To get product IDs, we usually define them in Dodo Dashboard.
        # I'll try to guess if there's a products endpoint.
        
        # Based on search results, sometimes we just define Product ID from dashboard.
        # Let's see what methods are available on the client.
        print(f"Available resources: {dir(client)}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
