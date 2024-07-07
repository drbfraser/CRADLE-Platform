import os, re

def rename_last_migration_file():
    directory = os.path.join(os.path.dirname(__file__), 'versions')
    files = sorted(
        [f for f in os.listdir(directory) if f.endswith('.py')],
        key=lambda x: os.path.getctime(os.path.join(directory, x))
    )
    if files:
        last_file = files[-1]
        match = re.match(r"(\d+)_", last_file)
        if not match:
            new_rev_id = len(files)
            new_filename = f"{new_rev_id}_{last_file}"
            os.rename(
                os.path.join(directory, last_file),
                os.path.join(directory, new_filename)
            )
            print(f"Renamed {last_file} to {new_filename}")
        else:
            print("Last migration file is already named properly.")

rename_last_migration_file()