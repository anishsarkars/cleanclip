
import inspect
from dodopayments import AsyncDodoPayments
# Convert to full string and print it
sig = str(inspect.signature(AsyncDodoPayments.__init__))
# Filter out the self
print(f"FULL_SIG: {sig}")
