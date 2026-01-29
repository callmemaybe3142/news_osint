import pandas as pd

df = pd.read_csv("data/ACLED Data_2026-01-25.csv")

print(len(df["latitude"].notna()))
print(df.shape)