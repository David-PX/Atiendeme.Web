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

            CreateMap<SpecialtiesDoctor, SpecialtiesDoctorDto>()
                   .ForMember(dest => dest.Id, opt => opt.AddTransform(s => 0)).ReverseMap();
        }
    }
}