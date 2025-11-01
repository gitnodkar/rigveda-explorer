import pandas as pd
import json
import os

# Read the original CSV (update filename as needed)
csv_filename = 'public/rigvedaretry_with_english2.csv'  # Change this to your actual CSV file name
df = pd.read_csv(csv_filename)

# Dictionary to hold transliterations: key = (mandala, local_sukta, verse), value = transliteration
trans_dict = {}

# Rigveda main sukta counts per mandala (excluding M8 Valakhilya: 92 instead of 103)
mandala_counts_main = [191, 43, 62, 58, 87, 75, 104, 92, 114, 191]
cumul_main = [0]
for c in mandala_counts_main:
    cumul_main.append(cumul_main[-1] + c)


# Helper to get (mandala, local_sukta) from global suktaNumber (main sequence)
def get_mandala_local_sukta(global_s):
    for m in range(1, 11):
        if cumul_main[m - 1] < global_s <= cumul_main[m]:
            local_s = global_s - cumul_main[m - 1]
            return m, local_s
    print(f"Warning: Global sukta {global_s} out of range (1-1017 main).")
    return None


# Define the JSON folder path
json_folder = 'transliteration data'

# Loop over JSON files for each "chunk" (1 to 10)
total_trans_loaded = 0
for mandala_num in range(1, 11):
    json_filename = os.path.join(json_folder, f'mandal{mandala_num}.json')
    trans_loaded_in_file = 0
    try:
        with open(json_filename, 'r', encoding='utf-8') as f:
            json_obj = json.load(f)

        if mandala_num == 8:
            # Special sequential handling for M8 (pre-Val 1-48, Val 49-59, post-Val 60-103)
            suktas_list = json_obj['mandalas'][0]['suktas']
            m = 8
            for idx, sukta in enumerate(suktas_list):
                s_local = idx + 1
                for verse in sukta['verses']:
                    v = verse['verseNumber']
                    trans = verse.get('transliteration', '')
                    trans_dict[(m, s_local, v)] = trans
                    trans_loaded_in_file += 1
        else:
            # Normal extraction using global suktaNumber and main cumul
            for mandala_data in json_obj['mandalas']:
                for sukta in mandala_data['suktas']:
                    s_global = sukta['suktaNumber']
                    key_ms = get_mandala_local_sukta(s_global)
                    if not key_ms:
                        continue
                    m, s_local = key_ms
                    for verse in sukta['verses']:
                        v = verse['verseNumber']
                        trans = verse.get('transliteration', '')
                        trans_dict[(m, s_local, v)] = trans
                        trans_loaded_in_file += 1
        total_trans_loaded += trans_loaded_in_file
        print(f"Loaded {trans_loaded_in_file} transliterations from {json_filename} (Mandala {mandala_num} chunk)")
    except FileNotFoundError:
        print(f"Warning: {json_filename} not found, skipping.")
    except json.JSONDecodeError:
        print(f"Warning: Invalid JSON in {json_filename}, skipping.")
    except Exception as e:
        print(f"Error processing {json_filename}: {e}")

print(f"\nTotal transliterations loaded: {total_trans_loaded}")
print(f"Unique keys in dict: {len(trans_dict)}")

# Add the new column to the DataFrame
df['transliteration'] = df.apply(
    lambda row: trans_dict.get((int(row['mandala']), int(row['sukta']), int(row['verse'])), ''),
    axis=1
)

# Save the merged CSV
output_filename = 'public/rigveda_with_translit.csv'
df.to_csv(output_filename, index=False, encoding='utf-8')
print(f"Merged CSV saved as {output_filename}")

# Preview and match stats
print("\nPreview of merged DataFrame:")
print(df.head())
matches = (df['transliteration'] != '').sum()
print(f"\nRows with transliteration populated: {matches} out of {len(df)} total rows")

# Null/empty check
nulls = df.isnull().sum()['transliteration']
empties = (df['transliteration'] == '').sum()
print(f"NaN in transliteration: {nulls}")
print(f"Empty strings in transliteration: {empties}")
print(f"Total unmatched: {nulls + empties}")

# Per-mandala check (focus on M9/M10)
per_mandala_matches = df.groupby('mandala').apply(lambda g: (g['transliteration'] != '').sum())
per_mandala_total = df.groupby('mandala').size()
print("\nPer-mandala matches:")
for m in [9, 10]:
    print(f"M{m}: {per_mandala_matches[m]} / {per_mandala_total[m]}")