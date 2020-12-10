using Atiendeme.Entidades.Entidades.Dtos;
using Atiendeme.Entidades.Entidades.SQL;
using AutoMapper;

namespace Atiendeme.Web.Mapping
{
    public class AtiendemeMapper : Profile
    {
        public AtiendemeMapper()
        {
            CreateMap<ApplicationUser, ApplicationUserDto>()
                .ForMember(dest => dest.Password, opt => opt.AddTransform(s => null)).ReverseMap();

            CreateMap<ApplicationUser, DoctorDto>()
            .ForMember(dest => dest.Password, opt => opt.AddTransform(s => null)).ReverseMap();

            CreateMap<SpecialtiesDoctor, SpecialtiesDoctorDto>().ReverseMap();
            //.ForMember(dest => dest.Id, opt => opt.AddTransform(s => 0));

            CreateMap<DoctorLaborDays, DoctorLaborDaysDto>().ReverseMap();

            CreateMap<OfficesDoctors, OfficesDoctorsDto>();
            CreateMap<Offices, OfficeDto>().ReverseMap();

            CreateMap<Offices, ApplicationUserDto>().ReverseMap();

            CreateMap<OfficesDoctorsDto, OfficesDoctors>()
                   .ForMember(dest => dest.Doctor, opt => opt.AddTransform(s => null))
                   .ForMember(dest => dest.Office, opt => opt.AddTransform(s => null));
        }
    }
}