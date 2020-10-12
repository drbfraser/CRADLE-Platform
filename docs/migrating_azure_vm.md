# Duplicate a VM in a different Azure Subscription

## In the Existing Subscription: 

1. Clone the VM by creating a snapshot of the disk
    1. On the Azure portal, select Create a resource.
    2. Search for and select Snapshot.
    3. In the Snapshot window, select Create. The Create snapshot window appears.
    4. Enter a Name for the snapshot.
    5. Select an existing Resource group or enter the name of a new one.
    6. Select an Azure datacenter Location.
    7. For Source disk, select the managed disk to snapshot.
    8. Select the Account type to use to store the snapshot. Select Standard_HDD, unless you need the snapshot to be stored on a high-performing disk.
    9. Select Create.
    - https://docs.microsoft.com/en-us/azure/virtual-machines/windows/snapshot-copy-managed-disk

2. Create a temporary Ubuntu VM using the snapshot
   - http://gennaromigliaccio.com/how-to-duplicate-an-azure-virtual-machine


4. Create a generalized image using the temporary Ubuntu VM 
   - https://docs.microsoft.com/en-us/azure/virtual-machines/windows/capture-image-resource


5. Create shared image gallery
   -  https://docs.microsoft.com/en-us/azure/virtual-machines/linux/shared-images-portal

6. Add created image to shared image gallery

7. Give other user access to the shared image gallery using RBAC
8. New VMs can now be created using the shared image in the image gallery

Note: the shared image gallery can be used to keep track of image versions 

## In the New Subscription:

1. View the shared image gallery that was previously created and shared from the other subscription

2. Create VM from shared image in the shared image gallery:
   - https://docs.microsoft.com/en-us/azure/virtual-machines/windows/create-vm-generalized-managed

Note: Ensure that the newly created VM meets the hardware requirements, based on what the VM will be used for. 
Eg: 
- If the VM will be used as only as hosting server for the production server with 5 running Gunicorn workers, then the server must have at least 65 MB. 
- If the VM will be used as:
   - a hosting server for the production server, with 5 running Gunicorn workers, 260 MB is required
- a hosting server for the staging server, with 1 running Gunicorn workers, 65 MB is required
- a build server with 1 running Gitlab Runner, 1500 MB is required
- and a database server, 320 MB is required
- Total memory required for VM: 260 + 65 + 1500 + 320 = 2245 MB

Note: VMs should have a signifant amount additional of memory, above the minimum required memory amount for caching, minimize swapping, and ultimately will allow the VM to run more smoothly.

| VM Use                                        | Memory Requirements (MB)   | 
| ----------------------------------------------|:--------------------------:| 
| Running Server w/ 1 Gunicorn Worker           | 65                         | 
| Running Server w/ 5 Gunicorn Workers (2 CPUs) | 260                        | 
| Build Server                                  | 1500                       | 
| Database Server                               | 320                        | 

<hr>

## Other Resources:  

Create shared image gallery and images: 
- https://docs.microsoft.com/en-us/azure/virtual-machines/linux/shared-images-portal

Duplicate VM using snapshot and cloned image
- http://gennaromigliaccio.com/how-to-duplicate-an-azure-virtual-machine

Create managed image in azure
- https://docs.microsoft.com/en-us/azure/virtual-machines/windows/capture-image-resource